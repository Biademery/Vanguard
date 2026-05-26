import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { UserProfile, Appointment, BusinessMetrics } from "../src/types.js";

// Safe loading of Firebase Admin to prevent crashes on missing setup
let firestoreDb: any = null;
let isFirebaseActive = false;

// Pre-seeded database state (In-memory fallback + mirror)
export const memoryDb = {
  users: [] as any[],
  appointments: [] as Appointment[]
};

// Generates correct password hashes for seeded barbers on startup
const salt = bcrypt.genSaltSync(10);
const defaultPasswordHash = bcrypt.hashSync("vanguard123", salt);

// Professional Seed Data
export const SEEDED_BARBERS = [
  {
    uid: "barber-1",
    name: "Diego Cavalcanti",
    email: "diego@vanguard.com",
    role: "barber" as const,
    passwordHash: defaultPasswordHash,
    avatar: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300",
    specialty: "Master Barber - Cortes Clássicos e Escultura de Barba",
    bio: "Especialista em visagismo masculino e técnicas tradicionais de navalha quente."
  },
  {
    uid: "barber-2",
    name: "Marcus Fontes",
    email: "marcus@vanguard.com",
    role: "barber" as const,
    passwordHash: defaultPasswordHash,
    avatar: "https://images.unsplash.com/photo-1517832606589-7a598b38927e?auto=format&fit=crop&q=80&w=300",
    specialty: "Barbeiro Sênior - Barbaterapia e Alinhamento de Fios",
    bio: "Pesquisador de óleos essenciais focado em relaxamento e saúde capilar."
  },
  {
    uid: "barber-3",
    name: "Enzo Alencar",
    email: "enzo@vanguard.com",
    role: "barber" as const,
    passwordHash: defaultPasswordHash,
    avatar: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?auto=format&fit=crop&q=80&w=300",
    specialty: "Hair Stylist - Cortes Modernos e Tinturas de Alta Classe",
    bio: "Focado em tendências modernas de design capilar e coloração."
  }
];

// Helper to check and instantiate Firebase Admin dynamically
export async function initializeDatabase() {
  // Always load seeded barbers into memory first
  for (const barber of SEEDED_BARBERS) {
    if (!memoryDb.users.find(u => u.uid === barber.uid)) {
      memoryDb.users.push({
        uid: barber.uid,
        name: barber.name,
        email: barber.email,
        role: barber.role,
        passwordHash: barber.passwordHash,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Pre-seed some premium initial appointments so dashboard looks spectacular
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
  // Custom past dates for metrics calculations
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const beforeYesterday = new Date();
  beforeYesterday.setDate(beforeYesterday.getDate() - 2);
  const beforeYesterdayStr = beforeYesterday.toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const defaultAppointments: Appointment[] = [
    {
      id: "appt-1",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-1",
      customerName: "Dr. Geraldo Neto",
      service: "Vanguard Signature Combo",
      price: 190.00,
      date: yesterdayStr,
      time: "10:00",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appt-2",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-2",
      customerName: "Felipe Bronze",
      service: "Corte Vanguard Classic",
      price: 120.00,
      date: yesterdayStr,
      time: "14:00",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appt-3",
      barberId: "barber-2",
      barberName: "Marcus Fontes",
      customerId: "customer-3",
      customerName: "Dr. Roberto Lins",
      service: "Barba Termosellada Imperial",
      price: 90.00,
      date: yesterdayStr,
      time: "11:00",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appt-4",
      barberId: "barber-3",
      barberName: "Enzo Alencar",
      customerId: "customer-4",
      customerName: "Augusto Melo",
      service: "Alinhamento de Fios & Tonalização",
      price: 150.00,
      date: beforeYesterdayStr,
      time: "16:00",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appt-5",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-5",
      customerName: "Thiago Silva",
      service: "Aromaterapia & Massagem Capilar",
      price: 80.00,
      date: beforeYesterdayStr,
      time: "15:00",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Future Scheduled
    {
      id: "appt-6",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-1",
      customerName: "Dr. Geraldo Neto",
      service: "Corte Vanguard Classic",
      price: 120.00,
      date: todayStr,
      time: "11:00",
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appt-7",
      barberId: "barber-2",
      barberName: "Marcus Fontes",
      customerId: "customer-2",
      customerName: "Felipe Bronze",
      service: "Vanguard Signature Combo",
      price: 190.00,
      date: todayStr,
      time: "15:00",
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appt-8",
      barberId: "barber-1",
      barberName: "Diego Cavalcanti",
      customerId: "customer-3",
      customerName: "Dr. Roberto Lins",
      service: "Barba Termosellada Imperial",
      price: 90.00,
      date: tomorrowStr,
      time: "10:00",
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const appt of defaultAppointments) {
    if (!memoryDb.appointments.find(a => a.id === appt.id)) {
      memoryDb.appointments.push(appt);
    }
  }

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    let configData: any = null;
    if (fs.existsSync(configPath)) {
      configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }

    const admin = await import("firebase-admin");
    if (admin.default.apps.length === 0) {
      if (configData && configData.projectId) {
        admin.default.initializeApp({
          projectId: configData.projectId,
        });
      } else {
        admin.default.initializeApp();
      }
    }

    // Handles Firebase enterprise named database ID or defaults gracefully
    const dbId = configData?.firestoreDatabaseId || undefined;
    const { getFirestore } = await import("firebase-admin/firestore");
    if (dbId) {
      firestoreDb = getFirestore(admin.default.app(), dbId);
    } else {
      firestoreDb = getFirestore(admin.default.app());
    }

    // Verify Firestore connection with a small health test write
    if (firestoreDb) {
      await firestoreDb.collection("vanguard_health").doc("ping").set({
        ping: true,
        timestamp: new Date().toISOString()
      }, { merge: true });
      isFirebaseActive = true;
      console.log("=== FIREBASE ACTIVE === Connected to Firestore beautifully!");

      // Mirror current pre-seeded appts/users to Firestore if empty
      const usersSnap = await firestoreDb.collection("users").limit(3).get();
      if (usersSnap.empty) {
        console.log("Seeding users into Firestore...");
        for (const user of memoryDb.users) {
          await firestoreDb.collection("users").doc(user.uid).set(user);
        }
      } else {
        // Sync memory Db with current Firebase users
        const allUsers = await firestoreDb.collection("users").get();
        allUsers.forEach((docSnap: any) => {
          const ud = docSnap.data();
          if (!memoryDb.users.find(u => u.uid === ud.uid)) {
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
        // Sync memory Db with Firebase appointments
        const allAppts = await firestoreDb.collection("appointments").get();
        const loadedAppts: Appointment[] = [];
        allAppts.forEach((docSnap: any) => {
          loadedAppts.push(docSnap.data() as Appointment);
        });
        if (loadedAppts.length > 0) {
          memoryDb.appointments = loadedAppts;
        }
      }
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("firestore.googleapis.com") || errMsg.includes("API has not been used")) {
      console.log("\n===============================================================================================");
      console.log("💎 VANGUARD RESILIENCE ENGINE STATE: Local In-Memory Fast Ledger Mode Active");
      console.log("🎯 Reason: Cloud Firestore is unprovisioned, unauthorized, or declined by user.");
      console.log("🚀 Status: Running with custom ultra-fast fully simulated state engine (Active memoryDb).");
      console.log("===============================================================================================\n");
    } else {
      console.warn("Firebase Admin failed to start or write. Moving forward resiliently with memory database fallback. Note: ", errMsg);
    }
    isFirebaseActive = false;
  }
}

// Resilient helper to write documents
export async function writeDocument(collectionName: string, docId: string, data: any) {
  // 1. Always update local memory DB immediately (No delay, no risk)
  if (collectionName === "users") {
    const idx = memoryDb.users.findIndex(u => u.uid === docId);
    if (idx >= 0) {
      memoryDb.users[idx] = { ...memoryDb.users[idx], ...data };
    } else {
      memoryDb.users.push({ uid: docId, ...data });
    }
  } else if (collectionName === "appointments") {
    const idx = memoryDb.appointments.findIndex(a => a.id === docId);
    if (idx >= 0) {
      memoryDb.appointments[idx] = { ...memoryDb.appointments[idx], ...data, updatedAt: new Date().toISOString() };
    } else {
      memoryDb.appointments.push({ id: docId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
  }

  // 2. Try backing up to Firebase asynchronously (Failsafe)
  if (isFirebaseActive && firestoreDb) {
    try {
      await firestoreDb.collection(collectionName).doc(docId).set(data, { merge: true });
    } catch (err) {
      console.error(`Firebase error while writing to ${collectionName}/${docId}. Operating on resilient fallback database.`, err);
    }
  }
}

// Resilient helper to fetch users
export function getUserByEmail(email: string) {
  return memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(uid: string) {
  return memoryDb.users.find(u => u.uid === uid);
}

// Resilient helper to fetch appointments
export function getAppointments() {
  return memoryDb.appointments;
}

// Metrics calculators
export function calculateBarberMetrics(): BusinessMetrics {
  const completedAppts = memoryDb.appointments.filter(a => a.status === "completed");
  const cancelledAppts = memoryDb.appointments.filter(a => a.status === "cancelled");
  const scheduledAppts = memoryDb.appointments.filter(a => a.status === "scheduled");

  // Sum of prices for completed jobs
  const totalRevenue = completedAppts.reduce((sum, item) => sum + item.price, 0);

  // Group by services
  const serviceCounts: { [name: string]: { count: number; revenue: number } } = {};
  completedAppts.forEach(appt => {
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
