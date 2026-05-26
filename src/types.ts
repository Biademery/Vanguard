/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "barber" | "customer";

export type AppointmentStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface Appointment {
  id: string;
  barberId: string;
  barberName: string;
  customerId: string;
  customerName: string;
  service: string;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BarberInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialty: string;
  bio: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  description: string;
}

export interface PopularServiceMetric {
  service: string;
  count: number;
  revenue: number;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalAppointmentsCount: number;
  completedCount: number;
  cancelledCount: number;
  popularServices: PopularServiceMetric[];
}

export interface AISuggestionResponse {
  insight: string;
  timestamp: string;
  modelUsed: string;
}
