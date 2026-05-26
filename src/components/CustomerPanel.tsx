/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, Sparkles, UserCheck, CheckCircle, AlertTriangle, XCircle, LogOut, Scissors, RefreshCw } from "lucide-react";
import { api, PREMIUM_BARBERS, PREMIUM_SERVICES } from "../lib/api.js";
import { Appointment, UserProfile } from "../types.js";

interface CustomerPanelProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function CustomerPanel({ currentUser, onLogout }: CustomerPanelProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Appointment Fields
  const [selectedBarber, setSelectedBarber] = useState(PREMIUM_BARBERS[0]);
  const [selectedService, setSelectedService] = useState(PREMIUM_SERVICES[0]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Rescheduling state variables
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // 14 days list generation
  const [daysList, setDaysList] = useState<{ dateStr: string; label: string; weekday: string }[]>([]);

  useEffect(() => {
    // Generate next 14 days lists YYYY-MM-DD
    const list = [];
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 0; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const weekday = weekdays[d.getDay()];
      const label = d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
      list.push({ dateStr, label, weekday });
    }
    setDaysList(list);
    setSelectedDate(list[0].dateStr); // defaults to today

    loadClientAppointments();
  }, []);

  const loadClientAppointments = async () => {
    setLoadingAppts(true);
    setErrorMsg(null);
    try {
      const activeList = await api.getAppointments();
      // sort by date & time descending
      activeList.sort((a, b) => {
        const datetimeA = new Date(`${a.date}T${a.time}`);
        const datetimeB = new Date(`${b.date}T${b.time}`);
        return datetimeB.getTime() - datetimeA.getTime();
      });
      setAppointments(activeList);
    } catch (err: any) {
      setErrorMsg(err?.message || "Não foi possível resgatar seu histórico de atendimentos.");
    } finally {
      setLoadingAppts(false);
    }
  };

  // Pre-generate hours slots 08:00 to 21:00 inclusive
  const HOURLY_SLOTS = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  // Client-side helper check if slot is disabled (elapsed today or pre-existing booking)
  const isSlotDisabled = (date: string, time: string, ignoringAppointmentId: string | null = null): { disabled: boolean; reason?: string } => {
    // Today constraints: cannot book hours that passed
    const todayStr = new Date().toISOString().split("T")[0];
    if (date === todayStr) {
      const now = new Date();
      const currentHour = now.getHours();
      const slotHour = parseInt(time.split(":")[0], 10);
      if (slotHour <= currentHour) {
        return { disabled: true, reason: "Horário passado" };
      }
    }

    // Schedule collision with any active other appointment (status !== cancelled)
    const activeCollision = appointments.find(appt => 
      appt.barberId === (reschedulingId ? appointments.find(a=>a.id===reschedulingId)?.barberId : selectedBarber.id) &&
      appt.date === date &&
      appt.time === time &&
      appt.status !== "cancelled" &&
      appt.id !== ignoringAppointmentId // ignores own ID
    );

    if (activeCollision) {
      return { disabled: true, reason: "Reservado" };
    }

    return { disabled: false };
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMsg("Selecione um horário disponível da grade abaixo.");
      return;
    }
    
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.createAppointment({
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        service: selectedService.name,
        price: selectedService.price,
        date: selectedDate,
        time: selectedTime
      });

      setSuccessMsg(`Ritual de excelência agendado para o dia ${selectedDate} às ${selectedTime}!`);
      setSelectedTime(""); // reset
      loadClientAppointments();
      
      // Auto dismiss success toast
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocorreu um erro ao efetuar o agendamento corporativo.");
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await api.updateAppointmentStatus(id, "cancelled");
      setSuccessMsg("Lamentamos a desistência. Atendimento cancelado com sucesso.");
      loadClientAppointments();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Não foi possível cancelar o agendamento.");
    }
  };

  // Reschedule submission
  const triggerReschedule = async (apptId: string) => {
    setRescheduleError(null);
    if (!rescheduleTime) {
      setRescheduleError("Por favor, selecione um slot horário disponível.");
      return;
    }

    try {
      await api.rescheduleAppointment(apptId, rescheduleDate, rescheduleTime);
      setSuccessMsg("Agendamento remanejado com sucesso!");
      setReschedulingId(null);
      setRescheduleTime("");
      loadClientAppointments();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setRescheduleError(err?.message || "Erro ao reagendar atendimento no servidor.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      
      {/* Toast Notification area */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            id="toast-success"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-gold-950 border border-gold-400 text-gold-200 text-sm flex items-center gap-3 shadow-[0_10px_40px_rgba(197,168,128,0.25)] font-mono"
          >
            <CheckCircle className="w-5 h-5 text-gold-400 animate-pulse" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-gold-400">SESSÃO EXCLUSIVA DO MEMBRO</span>
          <h2 className="font-serif text-4xl text-gradient-gold tracking-tight mt-1">
            Olá, {currentUser.name}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Conecte-se com sua estética facial e capilar em alta performance.</p>
        </div>
        <button
          id="btn-customer-logout"
          onClick={onLogout}
          className="px-5 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold-500/20 text-xs font-mono uppercase tracking-widest text-gold-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gold-500" /> Sair do Sistema
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Booking Engine */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="glass-panel p-6 rounded-3xl border-gold-glow border">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif text-2xl text-gold-200">Reservar Experiência Vanguard</h3>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">

              {/* BARBER SELECTOR */}
              <div id="booking-barber-select">
                <label className="block text-[11px] uppercase tracking-widest text-gold-300/40 font-mono mb-3">
                  Selecione o Barbeiro de Confiança
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PREMIUM_BARBERS.map(barber => {
                    const isSelected = selectedBarber.id === barber.id;
                    return (
                      <button
                        id={`barber-card-${barber.id}`}
                        key={barber.id}
                        type="button"
                        onClick={() => { setSelectedBarber(barber); setSelectedTime(""); }}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${isSelected ? "border-gold-400 bg-gold-950/20" : "border-white/5 bg-transparent hover:border-white/10"}`}
                      >
                        <img 
                          src={barber.avatar} 
                          alt={barber.name} 
                          className="w-10 h-10 rounded-full object-cover mb-2.5 border border-gold-300/10"
                        />
                        <h4 className="text-xs font-semibold text-gray-200">{barber.name}</h4>
                        <p className="text-[10px] text-gold-300/60 font-sans mt-0.5 leading-snug line-clamp-2">{barber.specialty}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SERVICES SELECTOR */}
              <div id="booking-service-select">
                <label className="block text-[11px] uppercase tracking-widest text-gold-300/40 font-mono mb-3">
                  Selecione a Experiência Aromática
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {PREMIUM_SERVICES.map(service => {
                    const isSelected = selectedService.id === service.id;
                    return (
                      <button
                        id={`service-item-${service.id}`}
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className={`text-left p-4 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${isSelected ? "border-gold-400 bg-gold-950/25" : "border-white/5 bg-transparent hover:bg-white/[0.02]"}`}
                      >
                        <div className="max-w-[75%]">
                          <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                            {service.name}
                            {isSelected && <Sparkles className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 leading-normal font-sans">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold font-mono text-gold-300">R$ {service.price.toFixed(2)}</p>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5">{service.durationMin} MIN</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DATE SELECTOR */}
              <div id="booking-date-select">
                <label className="block text-[11px] uppercase tracking-widest text-gold-300/40 font-mono mb-3">
                  Selecione o Dia (Até 14 dias subsequentes)
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-3.5 custom-scrollbar scroll-smooth">
                  {daysList.map(node => {
                    const isSelected = selectedDate === node.dateStr;
                    return (
                      <button
                        id={`date-pill-${node.dateStr}`}
                        key={node.dateStr}
                        type="button"
                        onClick={() => { setSelectedDate(node.dateStr); setSelectedTime(""); }}
                        className={`shrink-0 py-3.5 px-5 rounded-2xl border text-center transition-all cursor-pointer ${isSelected ? "border-gold-400 bg-gold-900/35" : "border-white/5 bg-transparent hover:border-white/10"}`}
                      >
                        <p className="text-[10px] uppercase font-mono tracking-widest text-gold-300/50">{node.weekday}</p>
                        <p className={`text-sm font-bold mt-1 ${isSelected ? "text-gold-300 scale-105" : "text-gray-300"}`}>{node.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HOURS SLOTS GRID */}
              <div id="booking-hours-select">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[11px] uppercase tracking-widest text-gold-300/40 font-mono">
                    Grade Horária Disponível
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">Grade: 08:00 - 21:00 de hora em hora</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {HOURLY_SLOTS.map(time => {
                    const { disabled, reason } = isSlotDisabled(selectedDate, time);
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        id={`hour-slot-${time}`}
                        key={time}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 rounded-xl border text-xs font-mono text-center transition-all relative overflow-hidden ${disabled ? "border-white/0 bg-white/[0.01] text-gray-600 cursor-not-allowed" : isSelected ? "border-gold-300 bg-gold-400 text-black font-semibold shadow-[0_0_15px_rgba(197,168,128,0.25)] cursor-pointer" : "border-white/5 bg-black/20 text-gray-300 hover:border-gold-500/30 hover:bg-gold-950/10 cursor-pointer"}`}
                      >
                        {time}
                        {disabled && (
                          <span className="absolute bottom-0 left-0 right-0 py-0.5 bg-black/40 text-[7px] text-red-400/70 font-sans tracking-tight">
                            {reason || "indisp."}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BOOK BUTTON */}
              <button
                id="booking-confirm-btn"
                type="submit"
                disabled={!selectedTime}
                className="w-full py-4 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(197,168,128,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex justify-center items-center gap-2 shadow-[0_4px_30px_rgba(197,168,128,0.1)]"
              >
                <Scissors className="w-4 h-4 fill-black" />
                Agendar Atendimento de Elite
              </button>

            </form>
          </div>

        </div>

        {/* Right Column - Existing & Past Appts */}
        <div id="client-history-col" className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-gold-glow border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-2xl text-gold-200">Seus Atendimentos</h3>
              </div>
              <button 
                id="btn-client-history-refresh"
                onClick={loadClientAppointments}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gold-300 transition-colors cursor-pointer"
                title="Sincronizar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingAppts ? (
              <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-2">
                <svg className="animate-spin h-8 w-8 text-gold-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xs uppercase tracking-widest font-mono">Resgatando Histórico...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-20 text-center bg-black/15 rounded-2xl border border-white/5 text-gray-500 px-6">
                <p className="text-sm font-sans">Nenhum ritual agendado até o momento.</p>
                <p className="text-[11px] text-gold-500/70 mt-2 font-mono uppercase tracking-wider">Use o painel para agendar sua primeira experiência!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1.5 custom-scrollbar">
                {appointments.map(appt => {
                  const isCancelled = appt.status === "cancelled";
                  const isCompleted = appt.status === "completed";
                  const isInProgress = appt.status === "in-progress";
                  const isScheduled = appt.status === "scheduled";

                  const isReschedulingThis = reschedulingId === appt.id;

                  return (
                    <div 
                      id={`client-appt-card-${appt.id}`}
                      key={appt.id}
                      className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${isCancelled ? "border-white/5 bg-transparent opacity-60" : "border-white/5 bg-black/15 shadow-[0_4px_25px_rgba(0,0,0,0.15)] hover:border-gold-500/20"}`}
                    >
                      {/* Ribbon left decorations based on status */}
                      <div className={`absolute top-0 bottom-0 left-0 w-1 ${isCompleted ? "bg-green-500" : isInProgress ? "bg-amber-400 animate-pulse" : isCancelled ? "bg-red-500" : "bg-gold-500"}`} />

                      {/* Top Header */}
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <div>
                          <h4 className="text-sm font-bold text-gray-200">{appt.service}</h4>
                          <p className="text-[10px] text-gold-300 font-mono uppercase tracking-widest mt-0.5">Com {appt.barberName}</p>
                        </div>
                        {/* Status tag */}
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono uppercase tracking-wider ${isCompleted ? "bg-green-950/60 text-green-400 ring-1 ring-green-500/20" : isInProgress ? "bg-amber-950/60 text-amber-300 ring-1 ring-amber-400/20 animate-pulse" : isCancelled ? "bg-red-950/60 text-red-400 ring-1 ring-red-500/20" : "bg-gold-950/60 text-gold-300 ring-1 ring-gold-400/20"}`}>
                          {isCompleted ? "Concluído" : isInProgress ? "Em Curso" : isCancelled ? "Cancelado" : "Agendado"}
                        </span>
                      </div>

                      {/* Date & Pricing Info */}
                      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-b border-white/5 py-2 mb-3 pl-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gold-500" />
                          <span className="font-mono text-gray-300">{appt.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gold-500" />
                          <span className="font-mono text-gray-300">{appt.time}</span>
                        </div>
                        <div className="font-mono text-gold-400 font-bold">R$ {appt.price.toFixed(2)}</div>
                      </div>

                      {/* ACTIONS BAR */}
                      {isScheduled && !isReschedulingThis && (
                        <div className="flex gap-2 pl-2">
                          <button
                            id={`btn-reschedule-trigger-${appt.id}`}
                            onClick={() => {
                              setReschedulingId(appt.id);
                              setRescheduleDate(appt.date);
                              setRescheduleTime(appt.time);
                              setRescheduleError(null);
                            }}
                            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-gold-950/15 text-[10px] font-mono uppercase tracking-wider text-gold-300 border border-white/5 hover:border-gold-600/30 transition-all cursor-pointer text-center"
                          >
                            Reagendar
                          </button>
                          <button
                            id={`btn-cancel-appt-${appt.id}`}
                            onClick={() => cancelAppointment(appt.id)}
                            className="px-3.5 py-2 rounded-xl hover:bg-red-950/15 text-[10px] font-mono uppercase tracking-wider text-red-400 border border-transparent hover:border-red-950 transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {/* RESCHEDULING SUBPANEL */}
                      {isReschedulingThis && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pl-2 pr-1 border-t border-gold-500/10 pt-3 mt-1"
                        >
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <Clock className="w-3.5 h-3.5 text-gold-400 fill-gold-400/10" />
                            <h5 className="text-[10px] font-mono text-gold-300 uppercase tracking-widest">Escolher Nova Agenda</h5>
                          </div>

                          {rescheduleError && (
                            <p className="text-[9px] text-red-400 mb-2 font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" /> {rescheduleError}
                            </p>
                          )}

                          {/* Quick selection in scheduling override */}
                          <div id="reschedule-selector-area" className="space-y-3">
                            <div>
                              <label className="block text-[8px] text-gray-500 font-mono uppercase tracking-wider mb-1">Dia Atendimento</label>
                              <select
                                id="select-reschedule-date"
                                value={rescheduleDate}
                                onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleTime(""); }}
                                className="w-full py-1.5 px-2 bg-black border border-white/5 rounded-lg text-xs font-mono text-gray-300 focus:outline-none focus:border-gold-500/30"
                              >
                                {daysList.map(node => (
                                  <option key={node.dateStr} value={node.dateStr}>
                                    {node.weekday} - {node.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[8px] text-gray-500 font-mono uppercase tracking-wider mb-1">Hora Disponível</label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {HOURLY_SLOTS.map(t => {
                                  // Collision rule check passing other ID
                                  const { disabled, reason } = isSlotDisabled(rescheduleDate, t, appt.id);
                                  const isSelected = rescheduleTime === t;

                                  return (
                                    <button
                                      id={`resch-hour-slot-${appt.id}-${t}`}
                                      key={t}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() => setRescheduleTime(t)}
                                      className={`py-1 rounded-lg border text-[10px] font-mono text-center transition-all ${disabled ? "opacity-25 border-transparent pointer-events-none" : isSelected ? "border-gold-300 bg-gold-400 text-black font-semibold" : "border-white/5 bg-transparent text-gray-300 hover:border-gold-500/20"}`}
                                    >
                                      {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Options action buttons */}
                            <div className="flex gap-2 pt-2.5">
                              <button
                                id="btn-submit-reschedule"
                                onClick={() => triggerReschedule(appt.id)}
                                className="flex-1 py-1.5 bg-gold-400 text-black font-bold uppercase font-mono tracking-wider text-[9px] rounded-lg hover:shadow-[0_0_10px_rgba(197,168,128,0.2)] transition-all cursor-pointer"
                              >
                                Confirmar Reagendamento
                              </button>
                              <button
                                id="btn-abort-reschedule"
                                onClick={() => setReschedulingId(null)}
                                className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-gray-400 font-mono tracking-wider text-[9px] rounded-lg transition-all cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
