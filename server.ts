import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dns from "dns";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { initializeDatabase, writeDocument, getUserByEmail, getUserById, getAppointments, calculateBarberMetrics } from "./server/db.js";
import { generateBusinessInsight } from "./server/gemini.js";
import { Appointment } from "./src/types.js";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "vanguard_luxury_secret_signature_default";

app.use(express.json());

// Extend express requests to hold verification parameters
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    name: string;
    email: string;
    role: "barber" | "customer";
  };
}

// Bearer Token Validation Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Sessão expirada. Autenticação por token necessária." });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Token inválido ou expirado." });
      return;
    }
    req.user = decoded;
    next();
  });
}

// === AUTHENTICATION API ===

// Register Route
app.post("/api/auth/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    res.status(400).json({ error: "Campos obrigatórios ausentes (nome, email, senha, cargo)." });
    return;
  }

  if (role !== "barber" && role !== "customer") {
    res.status(400).json({ error: "Cargo inválido. Escolha 'barber' ou 'customer'." });
    return;
  }

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    res.status(409).json({ error: "Este endereço de email já está registrado na plataforma Vanguard." });
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const uid = "u-" + Math.random().toString(36).substr(2, 9);

    const newUser = {
      uid,
      name,
      email: email.toLowerCase(),
      role,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await writeDocument("users", uid, newUser);

    const token = jwt.sign(
      { uid, name, email: newUser.email, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { uid, name, email: newUser.email, role }
    });
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro ao criar o registro premium. Tente novamente." });
  }
});

// Login Route
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    return;
  }

  const user = getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Credenciais inválidas. Email não cadastrado na Vanguard." });
    return;
  }

  // Compare Password
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: "Credenciais inválidas. Senha incorreta." });
    return;
  }

  const token = jwt.sign(
    { uid: user.uid, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// === OPERATIONAL ENDPOINTS (PROTECTED) ===

// Get Appointments API
app.get("/api/appointments", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allAppointments = getAppointments();

  // Barbers can see every schedule. Customers only see their own bookings.
  if (user.role === "barber") {
    res.json(allAppointments);
  } else {
    const customerAppts = allAppointments.filter(a => a.customerId === user.uid);
    res.json(customerAppts);
  }
});

// Create Booking API
app.post("/api/appointments", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { barberId, barberName, service, price, date, time } = req.body;

  if (!barberId || !barberName || !service || !price || !date || !time) {
    res.status(400).json({ error: "Campos do agendamento incompletos." });
    return;
  }

  // 14-days scheduling limit check
  const selectedDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);
  maxDate.setHours(23, 59, 59, 999);

  if (selectedDate < today || selectedDate > maxDate) {
    res.status(400).json({ error: "Data fora do limite de agendamento (máximo de 14 dias subsequentes)." });
    return;
  }

  // Today constraints: Cannot book clock hours that occurred in the past
  const dateStr = today.toISOString().split("T")[0];
  if (date === dateStr) {
    const now = new Date();
    const currentHour = now.getHours();
    const bookHour = parseInt(time.split(":")[0], 10);
    if (bookHour <= currentHour) {
      res.status(400).json({ error: "Não é possível agendar um horário retroativo ou corrente para o dia de hoje." });
      return;
    }
  }

  // Rigorous Schedule Collision Enforcement (No double-booking)
  const allAppointments = getAppointments();
  const collisionFound = allAppointments.find(a => 
    a.barberId === barberId &&
    a.date === date &&
    a.time === time &&
    a.status !== "cancelled"
  );

  if (collisionFound) {
    res.status(409).json({ error: "Horário indisponível. Este barbeiro já possui um atendimento ativo neste slot." });
    return;
  }

  try {
    const appointmentId = "appt-" + Math.random().toString(36).substr(2, 9);
    const newAppointment: Appointment = {
      id: appointmentId,
      barberId,
      barberName,
      customerId: user.uid,
      customerName: user.name,
      service,
      price: parseFloat(price),
      date,
      time,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await writeDocument("appointments", appointmentId, newAppointment);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro ao salvar seu agendamento no Firestore." });
  }
});

// Update Position Status Quick Action API
app.patch("/api/appointments/:id/status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["scheduled", "in-progress", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Status inválido fornecido." });
    return;
  }

  const allAppointments = getAppointments();
  const appointment = allAppointments.find(a => a.id === id);

  if (!appointment) {
    res.status(404).json({ error: "Agendamento não encontrado para alteração." });
    return;
  }

  try {
    const updatedData = {
      ...appointment,
      status,
      updatedAt: new Date().toISOString()
    };

    await writeDocument("appointments", id, updatedData);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar estado do agendamento." });
  }
});

// Reschedule API (with server-side collision checker and custom ID ignore checking rule)
app.patch("/api/appointments/:id/reschedule", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { date, time } = req.body;

  if (!date || !time) {
    res.status(400).json({ error: "Campos de nova data e novo horário são imperativos." });
    return;
  }

  const allAppointments = getAppointments();
  const appointment = allAppointments.find(a => a.id === id);

  if (!appointment) {
    res.status(404).json({ error: "Agendamento correspondente não encontrado." });
    return;
  }

  // 14-days range validation
  const selectedDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);
  maxDate.setHours(23, 59, 59, 999);

  if (selectedDate < today || selectedDate > maxDate) {
    res.status(400).json({ error: "Data fora do limite corporativo das próximas duas semanas." });
    return;
  }

  // Today constraints: No past clock schedules
  const dateStr = today.toISOString().split("T")[0];
  if (date === dateStr) {
    const now = new Date();
    const currentHour = now.getHours();
    const bookHour = parseInt(time.split(":")[0], 10);
    if (bookHour <= currentHour) {
      res.status(400).json({ error: "Não é viável reagendar para um espaço de tempo que já expirou hoje." });
      return;
    }
  }

  // Rigorous Server-Side Collision with Own ID Exclusion
  const collisionFound = allAppointments.find(a => 
    a.barberId === appointment.barberId &&
    a.date === date &&
    a.time === time &&
    a.status !== "cancelled" &&
    a.id !== id // EXCLUDES OWN IDENTIFIER
  );

  if (collisionFound) {
    res.status(409).json({ error: "Colisão de agenda detectada. Este horário já está reservado para outro cliente." });
    return;
  }

  try {
    const updatedData = {
      ...appointment,
      date,
      time,
      status: "scheduled" as const, // resets to scheduled state on change
      updatedAt: new Date().toISOString()
    };

    await writeDocument("appointments", id, updatedData);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Erro crítico ao redefinir agendamento no Firestore." });
  }
});

// Get Business Performance Metrics API
app.get("/api/barbers/metrics", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  if (user.role !== "barber") {
    res.status(403).json({ error: "Apenas barbeiros corporativos possuem acesso às métricas comerciais." });
    return;
  }

  const metrics = calculateBarberMetrics();
  res.json(metrics);
});

// Gemini AI Sales Advice Endpoint (Secure proxy)
app.get("/api/ai/insight", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  if (user.role !== "barber") {
    res.status(403).json({ error: "Acesso reservado aos consultores de equipe." });
    return;
  }

  try {
    const metrics = calculateBarberMetrics();
    const insightText = await generateBusinessInsight(metrics);

    res.json({
      insight: insightText,
      timestamp: new Date().toISOString(),
      modelUsed: process.env.GEMINI_API_KEY ? "gemini-3.5-flash" : "local-vanguard-engine"
    });
  } catch (error) {
    console.error("Gemini route error:", error);
    res.status(500).json({ error: "Falha ao requisitar insight aos engenheiros de IA." });
  }
});

// === DEV SERVER / STATIC SERVING VITE MIDDLEWARE ===

async function startServer() {
  // Try initializing the database first
  await initializeDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vanguard Server] Running in http://localhost:${PORT}`);
  });
}

startServer();
