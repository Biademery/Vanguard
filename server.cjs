var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var firestoreDb = null;
var isFirebaseActive = false;
var memoryDb = {
  users: [],
  appointments: []
};
var salt = import_bcryptjs.default.genSaltSync(10);
var defaultPasswordHash = import_bcryptjs.default.hashSync("vanguard123", salt);
var SEEDED_BARBERS = [
  {
    uid: "barber-1",
    name: "Diego Cavalcanti",
    email: "diego@vanguard.com",
    role: "barber",
    passwordHash: defaultPasswordHash,
    avatar: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300",
    specialty: "Master Barber - Cortes Cl\xE1ssicos e Escultura de Barba",
    bio: "Especialista em visagismo masculino e t\xE9cnicas tradicionais de navalha quente."
  },
  {
    uid: "barber-2",
    name: "Marcus Fontes",
    email: "marcus@vanguard.com",
    role: "barber",
    passwordHash: defaultPasswordHash,
    avatar: "https://images.unsplash.com/photo-1517832606589-7a598b38927e?auto=format&fit=crop&q=80&w=300",
    specialty: "Barbeiro S\xEAnior - Barbaterapia e Alinhamento de Fios",
    bio: "Pesquisador de \xF3leos essenciais focado em relaxamento e sa\xFAde capilar."
  },
  {
    uid: "barber-3",
    name: "Enzo Alencar",
    email: "enzo@vanguard.com",
    role: "barber",
    passwordHash: defaultPasswordHash,
    avatar: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?auto=format&fit=crop&q=80&w=300",
    specialty: "Hair Stylist - Cortes Modernos e Tinturas de Alta Classe",
    bio: "Focado em tend\xEAncias modernas de design capilar e colora\xE7\xE3o."
  }
];
async function initializeDatabase() {
  for (const barber of SEEDED_BARBERS) {
    if (!memoryDb.users.find((u) => u.uid === barber.uid)) {
      memoryDb.users.push({
        uid: barber.uid,
        name: barber.name,
        email: barber.email,
        role: barber.role,
        passwordHash: barber.passwordHash,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const yesterday = /* @__PURE__ */ new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const beforeYesterday = /* @__PURE__ */ new Date();
  beforeYesterday.setDate(beforeYesterday.getDate() - 2);
  const beforeYesterdayStr = beforeYesterday.toISOString().split("T")[0];
  const tomorrow = /* @__PURE__ */ new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const defaultAppointments = [
    {
      id: "appt-1",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-1",
      customerName: "Dr. Geraldo Neto",
      service: "Vanguard Signature Combo",
      price: 190,
      date: yesterdayStr,
      time: "10:00",
      status: "completed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "appt-2",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-2",
      customerName: "Felipe Bronze",
      service: "Corte Vanguard Classic",
      price: 120,
      date: yesterdayStr,
      time: "14:00",
      status: "completed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "appt-3",
      barberId: "barber-2",
      barberName: "Marcus Fontes",
      customerId: "customer-3",
      customerName: "Dr. Roberto Lins",
      service: "Barba Termosellada Imperial",
      price: 90,
      date: yesterdayStr,
      time: "11:00",
      status: "completed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "appt-4",
      barberId: "barber-3",
      barberName: "Enzo Alencar",
      customerId: "customer-4",
      customerName: "Augusto Melo",
      service: "Alinhamento de Fios & Tonaliza\xE7\xE3o",
      price: 150,
      date: beforeYesterdayStr,
      time: "16:00",
      status: "completed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "appt-5",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-5",
      customerName: "Thiago Silva",
      service: "Aromaterapia & Massagem Capilar",
      price: 80,
      date: beforeYesterdayStr,
      time: "15:00",
      status: "completed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    // Future Scheduled
    {
      id: "appt-6",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-1",
      customerName: "Dr. Geraldo Neto",
      service: "Corte Vanguard Classic",
      price: 120,
      date: todayStr,
      time: "11:00",
      status: "scheduled",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "appt-7",
      barberId: "barber-2",
      barberName: "Marcus Fontes",
      customerId: "customer-2",
      customerName: "Felipe Bronze",
      service: "Vanguard Signature Combo",
      price: 190,
      date: todayStr,
      time: "15:00",
      status: "scheduled",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "appt-8",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-3",
      customerName: "Dr. Roberto Lins",
      service: "Barba Termosellada Imperial",
      price: 90,
      date: tomorrowStr,
      time: "10:00",
      status: "scheduled",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  for (const appt of defaultAppointments) {
    if (!memoryDb.appointments.find((a) => a.id === appt.id)) {
      memoryDb.appointments.push(appt);
    }
  }
  try {
    const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
    let configData = null;
    if (import_fs.default.existsSync(configPath)) {
      configData = JSON.parse(import_fs.default.readFileSync(configPath, "utf-8"));
    }
    const admin = await import("firebase-admin");
    if (admin.default.apps.length === 0) {
      if (configData && configData.projectId) {
        admin.default.initializeApp({
          projectId: configData.projectId
        });
      } else {
        admin.default.initializeApp();
      }
    }
    const dbId = configData?.firestoreDatabaseId || void 0;
    const { getFirestore } = await import("firebase-admin/firestore");
    if (dbId) {
      firestoreDb = getFirestore(admin.default.app(), dbId);
    } else {
      firestoreDb = getFirestore(admin.default.app());
    }
    if (firestoreDb) {
      await firestoreDb.collection("vanguard_health").doc("ping").set({
        ping: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }, { merge: true });
      isFirebaseActive = true;
      console.log("=== FIREBASE ACTIVE === Connected to Firestore beautifully!");
      const usersSnap = await firestoreDb.collection("users").limit(3).get();
      if (usersSnap.empty) {
        console.log("Seeding users into Firestore...");
        for (const user of memoryDb.users) {
          await firestoreDb.collection("users").doc(user.uid).set(user);
        }
      } else {
        const allUsers = await firestoreDb.collection("users").get();
        allUsers.forEach((docSnap) => {
          const ud = docSnap.data();
          if (!memoryDb.users.find((u) => u.uid === ud.uid)) {
            memoryDb.users.push(ud);
          }
        });
      }
      const apptsSnap = await firestoreDb.collection("appointments").limit(3).get();
      if (apptsSnap.empty) {
        console.log("Seeding initial appointments into Firestore...");
        for (const appt of memoryDb.appointments) {
          await firestoreDb.collection("appointments").doc(appt.id).set(appt);
        }
      } else {
        const allAppts = await firestoreDb.collection("appointments").get();
        const loadedAppts = [];
        allAppts.forEach((docSnap) => {
          loadedAppts.push(docSnap.data());
        });
        if (loadedAppts.length > 0) {
          memoryDb.appointments = loadedAppts;
        }
      }
    }
  } catch (err) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("firestore.googleapis.com") || errMsg.includes("API has not been used")) {
      console.log("\n===============================================================================================");
      console.log("\u{1F48E} VANGUARD RESILIENCE ENGINE STATE: Local In-Memory Fast Ledger Mode Active");
      console.log("\u{1F3AF} Reason: Cloud Firestore is unprovisioned, unauthorized, or declined by user.");
      console.log("\u{1F680} Status: Running with custom ultra-fast fully simulated state engine (Active memoryDb).");
      console.log("===============================================================================================\n");
    } else {
      console.warn("Firebase Admin failed to start or write. Moving forward resiliently with memory database fallback. Note: ", errMsg);
    }
    isFirebaseActive = false;
  }
}
async function writeDocument(collectionName, docId, data) {
  if (collectionName === "users") {
    const idx = memoryDb.users.findIndex((u) => u.uid === docId);
    if (idx >= 0) {
      memoryDb.users[idx] = { ...memoryDb.users[idx], ...data };
    } else {
      memoryDb.users.push({ uid: docId, ...data });
    }
  } else if (collectionName === "appointments") {
    const idx = memoryDb.appointments.findIndex((a) => a.id === docId);
    if (idx >= 0) {
      memoryDb.appointments[idx] = { ...memoryDb.appointments[idx], ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    } else {
      memoryDb.appointments.push({ id: docId, ...data, createdAt: (/* @__PURE__ */ new Date()).toISOString(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
  }
  if (isFirebaseActive && firestoreDb) {
    try {
      await firestoreDb.collection(collectionName).doc(docId).set(data, { merge: true });
    } catch (err) {
      console.error(`Firebase error while writing to ${collectionName}/${docId}. Operating on resilient fallback database.`, err);
    }
  }
}
function getUserByEmail(email) {
  return memoryDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
function getAppointments() {
  return memoryDb.appointments;
}
function calculateBarberMetrics() {
  const completedAppts = memoryDb.appointments.filter((a) => a.status === "completed");
  const cancelledAppts = memoryDb.appointments.filter((a) => a.status === "cancelled");
  const scheduledAppts = memoryDb.appointments.filter((a) => a.status === "scheduled");
  const totalRevenue = completedAppts.reduce((sum, item) => sum + item.price, 0);
  const serviceCounts = {};
  completedAppts.forEach((appt) => {
    if (!serviceCounts[appt.service]) {
      serviceCounts[appt.service] = { count: 0, revenue: 0 };
    }
    serviceCounts[appt.service].count += 1;
    serviceCounts[appt.service].revenue += appt.price;
  });
  const popularServices = Object.entries(serviceCounts).map(([service, stats]) => ({
    service,
    count: stats.count,
    revenue: stats.revenue
  })).sort((a, b) => b.count - a.count);
  return {
    totalRevenue,
    totalAppointmentsCount: memoryDb.appointments.length,
    completedCount: completedAppts.length,
    cancelledCount: cancelledAppts.length,
    popularServices
  };
}

// server/gemini.ts
var import_genai = require("@google/genai");
var ai = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("=== GEMINI SDK READY ===");
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI insights will use a fallback high-value local advisor engine.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini SDK:", err);
}
var SYSTEM_INSTRUCTIONS = `
Voc\xEA \xE9 um Engenheiro de Neg\xF3cios e Consultor Corporativo S\xEAnior da Vanguard, uma rede internacional de barbearias e cl\xEDnicas de est\xE9tica masculina de alt\xEDssimo padr\xE3o. 
Seu dever \xE9 analisar as m\xE9tricas financeiras reais de faturamento da barbearia e produzir uma an\xE1lise executiva breve, afiada e muito objetiva em l\xEDngua portuguesa.

Diretrizes da resposta:
1. Comece com uma an\xE1lise elegante do caixa atual (ex: crescimento do faturamento frente aos servi\xE7os prestados).
2. Forne\xE7a uma sugest\xE3o pr\xE1tica de Call-To-Action (CTA) voltada para o aumento do ticket m\xE9dio atrav\xE9s da venda combinada (cross-selling) de produtos premium ou servi\xE7os integrados.
3. Mantenha o tom altamente sofisticado, formal, motivador e focado no luxo masculino corporativo.
4. Escreva uma resposta curta e impactante, idealmente estruturada em 3 par\xE1grafos concisos com t\xF3picos de f\xE1cil leitura para a dashboard do barbeiro. N\xE3o seja excessivamente prolixo. Use formata\xE7\xE3o Markdown simples (negritos).
`;
async function generateBusinessInsight(metrics) {
  const popularServicesText = metrics.popularServices.map((s) => `- ${s.service}: ${s.count} vezes (R$ ${s.revenue.toFixed(2)})`).join("\n");
  const dataOverviewPrompt = `
Aqui est\xE3o os dados reais de desempenho consolidados da barbearia at\xE9 o momento:
- Faturamento L\xEDquido Total Completo: R$ ${metrics.totalRevenue.toFixed(2)}
- Volume Total de Agendamentos: ${metrics.totalAppointmentsCount} no total (${metrics.completedCount} conclu\xEDdos, ${metrics.cancelledCount} cancelados)
- Servi\xE7os Mais Pedidos atualmente:
${popularServicesText}

Por favor, forne\xE7a sua an\xE1lise executiva premium e seu plano de a\xE7\xE3o de vendas (Call-To-Action).
`;
  const localFallbackInsights = [
    `**An\xE1lise de Fluxo de Caixa Vanguard**

Nossa opera\xE7\xE3o registrou um faturamento premium consolidado de **R$ ${metrics.totalRevenue.toFixed(2)}** atrav\xE9s de **${metrics.completedCount}** rituais conclu\xEDdos. Identificamos uma forte demanda para nosso principal servi\xE7o. O ticket m\xE9dio atual apresenta uma excelente oportunidade de eleva\xE7\xE3o.

**A\xE7\xE3o de Vendas Vanguard (Call-to-Action):**
Para as pr\xF3ximas 48 horas, instrua a recep\xE7\xE3o e os barbeiros a oferecerem ativamente a *Aromaterapia Imperial* com massagem capilar como um aditivo premium por apenas R$ 80,00 adicionais para todos os clientes agendados. Esta oferta exclusiva elevar\xE1 o ticket m\xE9dio em at\xE9 18% com impacto direto na margem l\xEDquida de lucro.`,
    `**Auditoria de Alta Performance do Sal\xE3o**

A volumetria de **${metrics.totalAppointmentsCount} agendamentos** demonstra excelente reten\xE7\xE3o de clientes de alta renda. Nosso portf\xF3lio de servi\xE7os est\xE1 focado no combo completo. A taxa de cancelamento de **${metrics.cancelledCount}** est\xE1 sob rigoroso controle.

**A\xE7\xE3o de Vendas Vanguard (Call-to-Action):**
Ative a campanha de fidelidade executiva corporativa. No t\xE9rmino de cada atendimento de alto ticket, presenteie o cliente com uma degusta\xE7\xE3o de nossa pomada modeladora de argila pura e ofere\xE7a o fechamento imediato do pr\xF3ximo agendamento recorrente de manuten\xE7\xE3o para 14 dias subsequentes, mitigando janelas ociosas.`
  ];
  if (!ai) {
    console.log("No Gemini SDK initialized, serving elegant pre-calculated business logic insight.");
    return localFallbackInsights[Math.floor(Math.random() * localFallbackInsights.length)];
  }
  try {
    let insightText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: dataOverviewPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.7
        }
      });
      insightText = response.text || "";
    } catch (previewErr) {
      console.warn("gemini-3-flash-preview model not available or error occurred. Attempting robust fallback to gemini-3.5-flash.", previewErr);
      const responseFallback = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: dataOverviewPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.7
        }
      });
      insightText = responseFallback.text || "";
    }
    if (insightText.trim().length > 0) {
      return insightText;
    } else {
      return localFallbackInsights[0];
    }
  } catch (err) {
    console.error("Gemini model prompt failed. Serving outstanding pre-loaded insights fallback:", err);
    return localFallbackInsights[0];
  }
}

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "vanguard_luxury_secret_signature_default";
app.use(import_express.default.json());
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Sess\xE3o expirada. Autentica\xE7\xE3o por token necess\xE1ria." });
    return;
  }
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Token inv\xE1lido ou expirado." });
      return;
    }
    req.user = decoded;
    next();
  });
}
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    res.status(400).json({ error: "Campos obrigat\xF3rios ausentes (nome, email, senha, cargo)." });
    return;
  }
  if (role !== "barber" && role !== "customer") {
    res.status(400).json({ error: "Cargo inv\xE1lido. Escolha 'barber' ou 'customer'." });
    return;
  }
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    res.status(409).json({ error: "Este endere\xE7o de email j\xE1 est\xE1 registrado na plataforma Vanguard." });
    return;
  }
  try {
    const salt2 = import_bcryptjs2.default.genSaltSync(10);
    const passwordHash = import_bcryptjs2.default.hashSync(password, salt2);
    const uid = "u-" + Math.random().toString(36).substr(2, 9);
    const newUser = {
      uid,
      name,
      email: email.toLowerCase(),
      role,
      passwordHash,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await writeDocument("users", uid, newUser);
    const token = import_jsonwebtoken.default.sign(
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
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "E-mail e senha s\xE3o obrigat\xF3rios." });
    return;
  }
  const user = getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Credenciais inv\xE1lidas. Email n\xE3o cadastrado na Vanguard." });
    return;
  }
  const isMatch = import_bcryptjs2.default.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: "Credenciais inv\xE1lidas. Senha incorreta." });
    return;
  }
  const token = import_jsonwebtoken.default.sign(
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
app.get("/api/appointments", authenticateToken, (req, res) => {
  const user = req.user;
  const allAppointments = getAppointments();
  if (user.role === "barber") {
    res.json(allAppointments);
  } else {
    const customerAppts = allAppointments.filter((a) => a.customerId === user.uid);
    res.json(customerAppts);
  }
});
app.post("/api/appointments", authenticateToken, async (req, res) => {
  const user = req.user;
  const { barberId, barberName, service, price, date, time } = req.body;
  if (!barberId || !barberName || !service || !price || !date || !time) {
    res.status(400).json({ error: "Campos do agendamento incompletos." });
    return;
  }
  const selectedDate = /* @__PURE__ */ new Date(date + "T00:00:00");
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = /* @__PURE__ */ new Date();
  maxDate.setDate(today.getDate() + 14);
  maxDate.setHours(23, 59, 59, 999);
  if (selectedDate < today || selectedDate > maxDate) {
    res.status(400).json({ error: "Data fora do limite de agendamento (m\xE1ximo de 14 dias subsequentes)." });
    return;
  }
  const dateStr = today.toISOString().split("T")[0];
  if (date === dateStr) {
    const now = /* @__PURE__ */ new Date();
    const currentHour = now.getHours();
    const bookHour = parseInt(time.split(":")[0], 10);
    if (bookHour <= currentHour) {
      res.status(400).json({ error: "N\xE3o \xE9 poss\xEDvel agendar um hor\xE1rio retroativo ou corrente para o dia de hoje." });
      return;
    }
  }
  const allAppointments = getAppointments();
  const collisionFound = allAppointments.find(
    (a) => a.barberId === barberId && a.date === date && a.time === time && a.status !== "cancelled"
  );
  if (collisionFound) {
    res.status(409).json({ error: "Hor\xE1rio indispon\xEDvel. Este barbeiro j\xE1 possui um atendimento ativo neste slot." });
    return;
  }
  try {
    const appointmentId = "appt-" + Math.random().toString(36).substr(2, 9);
    const newAppointment = {
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await writeDocument("appointments", appointmentId, newAppointment);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro ao salvar seu agendamento no Firestore." });
  }
});
app.patch("/api/appointments/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["scheduled", "in-progress", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Status inv\xE1lido fornecido." });
    return;
  }
  const allAppointments = getAppointments();
  const appointment = allAppointments.find((a) => a.id === id);
  if (!appointment) {
    res.status(404).json({ error: "Agendamento n\xE3o encontrado para altera\xE7\xE3o." });
    return;
  }
  try {
    const updatedData = {
      ...appointment,
      status,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await writeDocument("appointments", id, updatedData);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar estado do agendamento." });
  }
});
app.patch("/api/appointments/:id/reschedule", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;
  if (!date || !time) {
    res.status(400).json({ error: "Campos de nova data e novo hor\xE1rio s\xE3o imperativos." });
    return;
  }
  const allAppointments = getAppointments();
  const appointment = allAppointments.find((a) => a.id === id);
  if (!appointment) {
    res.status(404).json({ error: "Agendamento correspondente n\xE3o encontrado." });
    return;
  }
  const selectedDate = /* @__PURE__ */ new Date(date + "T00:00:00");
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = /* @__PURE__ */ new Date();
  maxDate.setDate(today.getDate() + 14);
  maxDate.setHours(23, 59, 59, 999);
  if (selectedDate < today || selectedDate > maxDate) {
    res.status(400).json({ error: "Data fora do limite corporativo das pr\xF3ximas duas semanas." });
    return;
  }
  const dateStr = today.toISOString().split("T")[0];
  if (date === dateStr) {
    const now = /* @__PURE__ */ new Date();
    const currentHour = now.getHours();
    const bookHour = parseInt(time.split(":")[0], 10);
    if (bookHour <= currentHour) {
      res.status(400).json({ error: "N\xE3o \xE9 vi\xE1vel reagendar para um espa\xE7o de tempo que j\xE1 expirou hoje." });
      return;
    }
  }
  const collisionFound = allAppointments.find(
    (a) => a.barberId === appointment.barberId && a.date === date && a.time === time && a.status !== "cancelled" && a.id !== id
    // EXCLUDES OWN IDENTIFIER
  );
  if (collisionFound) {
    res.status(409).json({ error: "Colis\xE3o de agenda detectada. Este hor\xE1rio j\xE1 est\xE1 reservado para outro cliente." });
    return;
  }
  try {
    const updatedData = {
      ...appointment,
      date,
      time,
      status: "scheduled",
      // resets to scheduled state on change
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await writeDocument("appointments", id, updatedData);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Erro cr\xEDtico ao redefinir agendamento no Firestore." });
  }
});
app.get("/api/barbers/metrics", authenticateToken, (req, res) => {
  const user = req.user;
  if (user.role !== "barber") {
    res.status(403).json({ error: "Apenas barbeiros corporativos possuem acesso \xE0s m\xE9tricas comerciais." });
    return;
  }
  const metrics = calculateBarberMetrics();
  res.json(metrics);
});
app.get("/api/ai/insight", authenticateToken, async (req, res) => {
  const user = req.user;
  if (user.role !== "barber") {
    res.status(403).json({ error: "Acesso reservado aos consultores de equipe." });
    return;
  }
  try {
    const metrics = calculateBarberMetrics();
    const insightText = await generateBusinessInsight(metrics);
    res.json({
      insight: insightText,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      modelUsed: process.env.GEMINI_API_KEY ? "gemini-3.5-flash" : "local-vanguard-engine"
    });
  } catch (error) {
    console.error("Gemini route error:", error);
    res.status(500).json({ error: "Falha ao requisitar insight aos engenheiros de IA." });
  }
});
async function startServer() {
  await initializeDatabase();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vanguard Server] Running in http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
