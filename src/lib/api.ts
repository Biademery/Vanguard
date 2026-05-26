/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthResponse, UserProfile, Appointment, BusinessMetrics, AISuggestionResponse } from "../types.js";

const BASE_URL = "";

// Client-side Token management
export const api = {
  getToken: (): string | null => localStorage.getItem("vanguard_token"),
  
  setToken: (token: string): void => localStorage.setItem("vanguard_token", token),
  
  clearToken: (): void => {
    localStorage.removeItem("vanguard_token");
    localStorage.removeItem("vanguard_user");
  },

  getCurrentUser: (): UserProfile | null => {
    const userJson = localStorage.getItem("vanguard_user");
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: UserProfile): void => {
    localStorage.setItem("vanguard_user", JSON.stringify(user));
  },

  // HTTP Helper with auth header injecting
  request: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = api.getToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const config = {
      ...options,
      headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erro de rede: ${response.status}`);
    }

    return data as T;
  },

  // Auth operations
  login: async (email: string, passwordString: string): Promise<UserProfile> => {
    const res = await api.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: passwordString })
    });
    api.setToken(res.token);
    api.setCurrentUser(res.user);
    return res.user;
  },

  register: async (name: string, email: string, passwordString: string, role: "barber" | "customer"): Promise<UserProfile> => {
    const res = await api.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password: passwordString, role })
    });
    api.setToken(res.token);
    api.setCurrentUser(res.user);
    return res.user;
  },

  // Appointment operations
  getAppointments: async (): Promise<Appointment[]> => {
    return api.request<Appointment[]>("/api/appointments");
  },

  createAppointment: async (appointmentData: {
    barberId: string;
    barberName: string;
    service: string;
    price: number;
    date: string;
    time: string;
  }): Promise<Appointment> => {
    return api.request<Appointment>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData)
    });
  },

  updateAppointmentStatus: async (id: string, status: string): Promise<Appointment> => {
    return api.request<Appointment>(`/api/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  },

  rescheduleAppointment: async (id: string, date: string, time: string): Promise<Appointment> => {
    return api.request<Appointment>(`/api/appointments/${id}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify({ date, time })
    });
  },

  // Barber intelligence and dashboard stats
  getBarberMetrics: async (): Promise<BusinessMetrics> => {
    return api.request<BusinessMetrics>("/api/barbers/metrics");
  },

  getGeminiAdvice: async (): Promise<AISuggestionResponse> => {
    return api.request<AISuggestionResponse>("/api/ai/insight");
  }
};

// Static Data lists helpful for booking
export const PREMIUM_SERVICES = [
  {
    id: "s1",
    name: "Corte Vanguard Classic",
    price: 120.00,
    durationMin: 45,
    description: "Corte artesanal refinado com visagismo completo, lavagem premium e finalização estilizada."
  },
  {
    id: "s2",
    name: "Barba Termosellada Imperial",
    price: 90.00,
    durationMin: 45,
    description: "Navalha de alta precisão com aplicação de óleos aromáticos, toalha quente vaporizada e balms restauradores."
  },
  {
    id: "s3",
    name: "Vanguard Signature Combo",
    price: 190.00,
    durationMin: 75,
    description: "O ritual definitivo do cavalheiro moderno. Unificação do Corte Vanguard com a Barba Termosellada Imperial."
  },
  {
    id: "s4",
    name: "Alinhamento de Fios & Tonalização",
    price: 150.00,
    durationMin: 60,
    description: "Restauração de fisionomia masculina por meio de redução de frizz capilar e camuflagem sutil de fios brancos."
  },
  {
    id: "s5",
    name: "Aromaterapia & Massagem Capilar",
    price: 80.00,
    durationMin: 30,
    description: "Massagem craniana profunda relaxante sob efeito de óleos essenciais selecionados."
  }
];

export const PREMIUM_BARBERS = [
  {
    id: "barber-1",
    name: "Diego Cavalcanti",
    specialty: "Master Barber - Cortes de Precisão e Barbas Clássicas",
    avatar: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "barber-2",
    name: "Marcus Fontes",
    specialty: "Barbeiro Sênior - Barbaterapia e Terapias Capilares",
    avatar: "https://images.unsplash.com/photo-1517832606589-7a598b38927e?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "barber-3",
    name: "Enzo Alencar",
    specialty: "Hair Stylist - Cortes Modernos e Alinhamentos",
    avatar: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?auto=format&fit=crop&q=80&w=300"
  }
];
