/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scissors, DollarSign, BarChart3, TrendingUp, Sparkles, CheckCircle, Clock, AlertCircle, XCircle, LogOut, Loader2, ArrowRight, Filter, RefreshCw, Calendar, User, Save, Plus, HelpCircle } from "lucide-react";
import { api, PREMIUM_BARBERS } from "../lib/api.js";
import { Appointment, UserProfile, BusinessMetrics, AISuggestionResponse, BarberInfo, ServiceItem } from "../types.js";

interface BarberPanelProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

const HOURLY_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

export default function BarberPanel({ currentUser, onLogout }: BarberPanelProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [aiInsight, setAiInsight] = useState<AISuggestionResponse | null>(null);
  
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter conditions
  const [barberFilter, setBarberFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<"all" | "today">("today");

  // Sub Tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "profile">("dashboard");

  // Dynamic system catalogs
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [allBarbers, setAllBarbers] = useState<BarberInfo[]>([]);

  // Barber's own editable attributes
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [avatar, setAvatar] = useState("");
  const [workingHours, setWorkingHours] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // New Service addition form states
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("45");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingService, setSavingService] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    setGeneralError(null);
    try {
      // Load both metrics & appointments & dynamic lists
      const [allAppts, barMetrics, systemServices, systemBarbers] = await Promise.all([
        api.getAppointments(),
        api.getBarberMetrics(),
        api.getServices(),
        api.getBarbers()
      ]);

      // Sort chronological
      allAppts.sort((a, b) => {
        const datetimeA = new Date(`${a.date}T${a.time}`);
        const datetimeB = new Date(`${b.date}T${b.time}`);
        return datetimeA.getTime() - datetimeB.getTime();
      });

      setAppointments(allAppts);
      setMetrics(barMetrics);
      setAllServices(systemServices);
      setAllBarbers(systemBarbers);

      // Find the logged-in barber profile
      const myProfile = systemBarbers.find(b => b.id === currentUser.uid);
      if (myProfile) {
        setBio(myProfile.bio || "");
        setSpecialty(myProfile.specialty || "Barbeiro Vanguard Sênior");
        setAvatar(myProfile.avatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300");
        setWorkingHours(myProfile.workingHours || HOURLY_SLOTS);
        setSelectedServices(myProfile.services || systemServices.map(s => s.id));
      } else {
        // If profile doesn't exist yet, we define default values
        setBio("Dedicação total ao corte masculino fino e às melhores técnicas de barbearia contemporânea.");
        setSpecialty("Barbeiro Sênior");
        setAvatar("https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300");
        setWorkingHours(HOURLY_SLOTS);
        setSelectedServices(systemServices.map(s => s.id));
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Algo falhou ao carregar as métricas operacionais.");
    } finally {
      setLoadingData(false);
    }
  };

  const loadAdvisorInsight = async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      const insight = await api.getGeminiAdvice();
      setAiInsight(insight);
    } catch (err: any) {
      setAiError(err?.message || "Falha ao se comunicar com o consultor Gemini.");
    } finally {
      setLoadingAI(false);
    }
  };

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await api.updateAppointmentStatus(id, nextStatus);
      setSuccessToast(`Agendamento atualizado para '${nextStatus}' com sucesso!`);
      loadDashboardData();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setGeneralError(err?.message || "Não foi possível migrar status do agendamento.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setGeneralError(null);
    try {
      await api.updateBarberProfile(currentUser.uid, {
        name: currentUser.name,
        specialty,
        bio,
        avatar: avatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
        workingHours,
        services: selectedServices
      });
      setSuccessToast("Perfil, horários e serviços atualizados com requinte!");
      await loadDashboardData();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setGeneralError(err?.message || "Erro ao atualizar perfil do barbeiro.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCustomService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    setSavingService(true);
    try {
      const added = await api.addCustomService({
        name: newServiceName,
        price: Number(newServicePrice) || 50,
        durationMin: Number(newServiceDuration) || 30,
        description: newServiceDesc || "Serviço personalizado de alta performance."
      });

      setSelectedServices(prev => [...prev, added.id]);
      setSuccessToast(`Serviço "${newServiceName}" cadastrado no catálogo com sucesso!`);
      
      setNewServiceName("");
      setNewServicePrice("");
      setNewServiceDuration("45");
      setNewServiceDesc("");
      setShowAddService(false);

      await loadDashboardData();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setGeneralError(err?.message || "Erro ao cadastrar novo serviço.");
    } finally {
      setSavingService(false);
    }
  };

  const toggleHourSlot = (hour: string) => {
    if (workingHours.includes(hour)) {
      setWorkingHours(prev => prev.filter(h => h !== hour));
    } else {
      setWorkingHours(prev => [...prev, hour].sort());
    }
  };

  const toggleServiceOffer = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    } else {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };

  // Filter handler
  const todayStr = new Date().toISOString().split("T")[0];
  const filteredAppointments = appointments.filter(appt => {
    const matchesBarber = barberFilter === "all" || appt.barberId === barberFilter;
    const matchesDay = dayFilter === "all" || appt.date === todayStr;
    return matchesBarber && matchesDay;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      
      {/* Toast Notification area */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            id="barber-toast-success"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-gold-950 border border-gold-400 text-gold-200 text-sm flex items-center gap-3 shadow-[0_10px_40px_rgba(197,168,128,0.25)] font-mono"
          >
            <CheckCircle className="w-5 h-5 text-gold-400 animate-pulse" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-gold-400">PAINEL EXECUTIVO CORPORATIVO</span>
          <h2 className="font-serif text-4xl text-gradient-gold tracking-tight mt-1">
            Gestão Vanguard Club
          </h2>
          <p className="text-xs text-gray-400 mt-1">Olá, {currentUser.name}. Acompanhe as métricas de faturamento e insights de inteligência tática.</p>
        </div>
        <div className="flex gap-3">
          <button
            id="btn-barber-refresh"
            onClick={loadDashboardData}
            disabled={loadingData}
            className="px-4 py-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-xs font-mono uppercase tracking-widest text-gold-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gold-500 ${loadingData ? 'animate-spin' : ''}`} /> Sincronizar
          </button>
          <button
            id="btn-barber-logout"
            onClick={onLogout}
            className="px-5 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold-500/20 text-xs font-mono uppercase tracking-widest text-gold-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-gold-500" /> Sair
          </button>
        </div>
      </div>

      {generalError && (
        <div id="general-alert" className="mb-6 p-4 rounded-xl bg-red-950/25 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Primary Sub Tabs */}
      <div className="flex border-b border-white/5 mb-8">
        <button
          id="barber-subtab-dashboard"
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-6 py-3.5 text-xs font-mono uppercase tracking-widest text-center transition-all border-b-2 cursor-pointer ${
            activeSubTab === "dashboard"
              ? "border-gold-500 text-gold-400 bg-white/[0.02]"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Métricas & Agenda de Hoje
        </button>
        <button
          id="barber-subtab-profile"
          onClick={() => setActiveSubTab("profile")}
          className={`px-6 py-3.5 text-xs font-mono uppercase tracking-widest text-center transition-all border-b-2 cursor-pointer ${
            activeSubTab === "profile"
              ? "border-gold-500 text-gold-400 bg-white/[0.02]"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Configurações de Perfil & Atendimento
        </button>
      </div>

      {activeSubTab === "dashboard" ? (
        <>
          {/* Overview Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* STAT 1: Revenue */}
        <div id="metric-revenue" className="glass-panel p-6 rounded-2xl border-gold-glow border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-16 h-16 text-gold-400" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Receita de Serviços (Caixa)</p>
          <h3 className="font-serif text-3xl text-gold-200 font-bold mt-2">
            R$ {metrics ? metrics.totalRevenue.toFixed(2) : "0,00"}
          </h3>
          <p className="text-[10.5px] text-green-400 font-mono mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Faturamento Líquido Total
          </p>
        </div>

        {/* STAT 2: Absolute volume of reservations */}
        <div id="metric-volume" className="glass-panel p-6 rounded-2xl border-gold-glow border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BarChart3 className="w-16 h-16 text-gold-400" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Sessões Consolidadas</p>
          <h3 className="font-serif text-3xl text-gold-200 font-bold mt-2">
            {metrics ? metrics.totalAppointmentsCount : "0"}
          </h3>
          <p className="text-[10.5px] text-gold-400/70 font-mono mt-1">
            Total de agendamentos no sistema
          </p>
        </div>

        {/* STAT 3: Atendimentos em Conclusão */}
        <div id="metric-concluded" className="glass-panel p-6 rounded-2xl border-gold-glow border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-16 h-16 text-gold-400" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Rituais Concluídos</p>
          <h3 className="font-serif text-3xl text-green-400 font-bold mt-2">
            {metrics ? metrics.completedCount : "0"}
          </h3>
          <p className="text-[10.5px] text-gray-400 font-mono mt-1">
            Entregues com selo premium
          </p>
        </div>

        {/* STAT 4: Cancelamentos */}
        <div id="metric-cancelled" className="glass-panel p-6 rounded-2xl border-gold-glow border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <XCircle className="w-16 h-16 text-gold-400" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Sessões Canceladas</p>
          <h3 className="font-serif text-3xl text-red-400 font-bold mt-2">
            {metrics ? metrics.cancelledCount : "0"}
          </h3>
          <p className="text-[10.5px] text-gray-400 font-mono mt-1">
            Abandono ou reagendamentos
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Left Column (Gemini AI Business Advisor & Metrics Graph) */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* SECURE GEMINI INTEGRATION CORE - Vanguard Advisor */}
          <div 
            id="gemini-advisor-card" 
            className="glass-panel p-6 rounded-3xl border border-gold-400/30 relative overflow-hidden shadow-[0_0_25px_rgba(197,168,128,0.06)] bg-radial-luxury"
          >
            {/* Pulsating decorative golden nodes in margin */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-gold-400/10">
                  <Sparkles className="w-5 h-5 text-gold-400 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-gold-200">Consultoria de Vendas Gemini</h3>
                  <p className="text-[9px] text-gold-300/50 uppercase tracking-widest font-mono">IA Consultiva Avançada</p>
                </div>
              </div>

              <span className="font-mono text-[9px] px-2.5 py-0.5 bg-gold-950 text-gold-400 ring-1 ring-gold-500/25 rounded-md">
                {aiInsight ? aiInsight.modelUsed : "Vanguard Intel"}
              </span>
            </div>

            {loadingAI ? (
              <div id="ai-loader-area" className="py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                <div className="space-y-1.5 max-w-sm">
                  <p className="text-xs font-mono uppercase tracking-wider text-gold-300 animate-pulse">Consultor Sênior está analisando os caixas...</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
                    Nossos engenheiros de IA mercantil estão enviando o faturamento líquido ao Gemini para deduzir o ticket de cross-selling...
                  </p>
                </div>
              </div>
            ) : aiError ? (
              <div id="ai-error-area" className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs flex gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Falha no Processamento IA</p>
                  <p className="text-[11px] text-gray-400 mt-1">{aiError}</p>
                </div>
              </div>
            ) : aiInsight ? (
              <motion.div 
                id="ai-content-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-300 leading-relaxed font-sans space-y-4"
              >
                <div className="p-4 bg-gold-950/15 border border-gold-500/10 rounded-2xl whitespace-pre-line text-left font-sans text-gray-200">
                  {aiInsight.insight}
                </div>
                <div className="text-[9px] text-gray-500 font-mono text-right">
                  Insight emitido em: {new Date(aiInsight.timestamp).toLocaleTimeString("pt-BR")}
                </div>
              </motion.div>
            ) : (
              <div id="ai-empty-area" className="py-10 text-center bg-black/10 rounded-2xl border border-white/5 text-gray-400">
                <Sparkles className="w-8 h-8 text-gold-400/30 mx-auto mb-2" />
                <p className="text-xs font-serif text-gray-300">Nenhum insight gerado recentemente</p>
                <p className="text-[10px] text-gray-500 mt-1 max-w-xs mx-auto">Gerencie uma consulta tática enviando o caixa atual da barbearia para o Gemini.</p>
              </div>
            )}

            <button
              id="btn-trigger-ai"
              onClick={loadAdvisorInsight}
              disabled={loadingAI || !metrics}
              className="mt-5 w-full py-3 bg-gradient-to-r from-gold-600 to-gold-400 text-black font-bold text-[11px] uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(197,168,128,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              Solicitar Insight Sênior (Gemini)
            </button>

          </div>

          {/* Core Service Performance Table */}
          <div className="glass-panel p-6 rounded-3xl border-gold-glow border">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif text-xl text-gold-200">Faturamento por Serviço</h3>
            </div>

            {loadingData ? (
              <div className="py-12 text-center text-gray-500 font-mono text-xs uppercase">Carregando...</div>
            ) : !metrics || metrics.popularServices.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-12">Nenhum faturamento registrado até o momento.</p>
            ) : (
              <div className="space-y-3">
                {metrics.popularServices.map((m, i) => (
                  <div key={i} className="p-3 bg-black/25 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{m.service}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{m.count} atendimentos concluídos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gold-300 font-bold">R$ {m.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (General Agenda queue) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-gold-glow border">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-5">
              <div>
                <h3 className="font-serif text-2xl text-gold-200">Agenda de Atendimentos</h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">Gestão das Filas de Trabalho</p>
              </div>

              {/* Day filter selection toggle */}
              <div className="flex rounded-lg bg-black/40 border border-white/5 p-1 shrink-0">
                <button
                  id="tab-day-today"
                  onClick={() => setDayFilter("today")}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${dayFilter === "today" ? "bg-gold-400 text-black font-bold" : "text-gray-400 hover:text-gray-200"}`}
                >
                  Hoje
                </button>
                <button
                  id="tab-day-all"
                  onClick={() => setDayFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${dayFilter === "all" ? "bg-gold-400 text-black font-bold" : "text-gray-400 hover:text-gray-200"}`}
                >
                  Tudo
                </button>
              </div>
            </div>

            {/* Barber Filter Select */}
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-4 h-4 text-gold-500" />
              <select
                id="barber-filter-dropdown"
                value={barberFilter}
                onChange={(e) => setBarberFilter(e.target.value)}
                className="flex-1 py-2 px-3 bg-black border border-white/5 rounded-xl text-xs font-mono text-gray-300 focus:outline-none focus:border-gold-500/35 cursor-pointer"
              >
                <option value="all">TODOS OS BARBEIROS DA VANGUARD</option>
                {PREMIUM_BARBERS.map(b => (
                  <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* List items representation */}
            {loadingData ? (
              <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                <p className="text-xs uppercase tracking-widest font-mono">Sincronizando Agenda...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="py-20 text-center bg-black/15 rounded-2xl border border-white/5 text-gray-500 px-6">
                <p className="text-sm font-sans">Nenhum atendimento para os filtros selecionados.</p>
                <p className="text-[10px] text-gold-500/50 mt-1 font-mono uppercase tracking-wider">
                  Filtros: {dayFilter === "today" ? "[Apenas Hoje]" : "[Todos os Dias]"} e Barbeiro {barberFilter === "all" ? "[Todos]" : `[Filtrado]`}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 select-none custom-scrollbar">
                {filteredAppointments.map(appt => {
                  const isScheduled = appt.status === "scheduled";
                  const isInProgress = appt.status === "in-progress";
                  const isCompleted = appt.status === "completed";
                  const isCancelled = appt.status === "cancelled";

                  return (
                    <div
                      id={`barber-appt-card-${appt.id}`}
                      key={appt.id}
                      className={`p-4 rounded-2xl border relative overflow-hidden transition-all ${isCancelled ? "opacity-40 bg-transparent border-white/5" : "bg-black/20 border-white/5 hover:border-gold-500/25"}`}
                    >
                      {/* Left vertical visual strip status decors */}
                      <div className={`absolute top-0 bottom-0 left-0 w-1 ${isCompleted ? "bg-green-500" : isInProgress ? "bg-amber-400 animate-pulse" : isCancelled ? "bg-red-500" : "bg-gold-500"}`} />

                      {/* Top Row details */}
                      <div className="flex justify-between items-start pl-2">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-widest">
                            Cliente: {appt.customerName}
                          </h4>
                          <h3 className="text-sm font-bold text-gray-200 mt-1">{appt.service}</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider ${isCompleted ? "bg-green-950/60 text-green-400 border border-green-500/20" : isInProgress ? "bg-amber-950/60 text-amber-300 border border-amber-400/20 animate-pulse" : isCancelled ? "bg-red-950/60 text-red-400 border border-red-500/20" : "bg-gold-950/60 text-gold-300 border border-gold-400/20"}`}>
                          {isCompleted ? "Concluído" : isInProgress ? "Em Curso" : isCancelled ? "Cancelado" : "Pendente"}
                        </span>
                      </div>

                      {/* Slot metadata */}
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 py-2 border-t border-b border-white/5 my-3 pl-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gold-500" />
                          <span className="font-mono">{appt.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gold-500" />
                          <span className="font-mono">{appt.time}</span>
                        </div>
                        <div className="font-mono text-gold-400 ml-auto font-bold text-xs">
                          R$ {appt.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Quick state change action buttons */}
                      {!isCompleted && !isCancelled && (
                        <div className="flex gap-2 pl-2">
                          
                          {isScheduled && (
                            <button
                              id={`barber-btn-progress-${appt.id}`}
                              onClick={() => updateStatus(appt.id, "in-progress")}
                              className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 rounded-lg text-[9px] font-mono uppercase tracking-wider text-amber-300 font-semibold transition-all cursor-pointer text-center"
                            >
                              Confirmar Presença (Fila)
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              id={`barber-btn-complete-${appt.id}`}
                              onClick={() => updateStatus(appt.id, "completed")}
                              className="flex-1 py-1.5 bg-green-600/15 hover:bg-green-500 hover:text-black border border-green-500/20 rounded-lg text-[9px] font-mono uppercase tracking-wider text-green-300 font-semibold transition-all cursor-pointer text-center"
                            >
                              Finalizar Serviço
                            </button>
                          )}

                          <button
                            id={`barber-btn-cancel-${appt.id}`}
                            onClick={() => updateStatus(appt.id, "cancelled")}
                            className="py-1.5 px-3 bg-red-950/10 hover:bg-red-500 hover:text-black border border-red-500/15 rounded-lg text-[9px] font-mono uppercase tracking-wider text-red-400 transition-all cursor-pointer text-center"
                          >
                            Cancelar
                          </button>

                        </div>
                      )}

                      {/* Footer assign metadata */}
                      <div className="mt-2 text-[9px] text-gray-500 font-mono pl-2 text-right">
                        Atendente: {appt.barberName}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>
        </>
      ) : (
        <motion.div
          id="barber-profile-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          {/* COLUMN 1: Basic aesthetic data (Specialty, Bio, Avatar Selection) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-gold-glow border relative overflow-hidden">
              <h3 className="font-serif text-lg text-gold-300 uppercase tracking-wider border-b border-white/5 pb-3 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-gold-400" /> Identidade de Estilo
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-2">
                    Especialidade / Título Profissional
                  </label>
                  <input
                    id="barber-specialty-input"
                    type="text"
                    required
                    placeholder="Ex: Master Barber, Especialista em Navalha"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500/40 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-2">
                    Sua Biografia e Filosofia de Corte
                  </label>
                  <textarea
                    id="barber-bio-textarea"
                    rows={4}
                    required
                    placeholder="Descreva seu estilo, técnicas preferidas e sofisticação de atendimento aos cavalheiros..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500/40 transition-all font-sans leading-relaxed resize-none cursor-text"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-2">
                    Foto de Perfil (Avatar URL)
                  </label>
                  <input
                    id="barber-avatar-input"
                    type="text"
                    placeholder="URL de uma foto em alta..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gold-500/40 transition-all font-mono"
                  />
                  <p className="text-[9px] text-gray-500 font-sans mt-2">
                    Insira uma URL externa ou use um de nossos modelos de retrato executivo sugeridos abaixo.
                  </p>
                  
                  {/* Avatar selection presets */}
                  <div className="flex gap-2.5 mt-3 justify-start overflow-x-auto pb-1">
                    {[
                      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
                      "https://images.unsplash.com/photo-1517832606589-7a598b38927e",
                      "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee",
                      "https://images.unsplash.com/photo-1540569014015-19a7be504e3a",
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                    ].map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatar(`${imgUrl}?auto=format&fit=crop&q=80&w=300`)}
                        className={`w-10 h-10 rounded-full overflow-hidden border transition-all shrink-0 ${
                          avatar.includes(imgUrl) ? "border-gold-400 scale-105 shadow-[0_0_10px_rgba(197,168,128,0.5)]" : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <img referrerPolicy="no-referrer" src={`${imgUrl}?auto=format&fit=crop&q=80&w=70`} alt="Preset avatar preview" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <button
                    id="barber-save-profile-btn"
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-gold-600 to-gold-400 border border-gold-300/20 rounded-xl text-black font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" /> Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-black" /> Salvar Identidade
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* COLUMN 2: Performance configuration - Hourly Availability & Products offered */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Hour Schedule Settings */}
            <div className="glass-panel p-6 rounded-2xl border-gold-glow border">
              <h3 className="font-serif text-lg text-gold-300 uppercase tracking-wider border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-400" /> Agenda Operacional
                </span>
                <span className="text-[10px] font-mono text-gold-400/80 uppercase tracking-widest pr-1">
                  {workingHours.length} Slots Ativos
                </span>
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Selecione as faixas de horário em que você estará disponível para receber agendamentos de clientes na Vanguard. Se desmarcar um horário (por exemplo, almoço), o cliente não poderá reservar você nessa faixa.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {HOURLY_SLOTS.map(hour => {
                  const isActive = workingHours.includes(hour);
                  return (
                    <button
                      key={hour}
                      id={`hour-chip-${hour}`}
                      type="button"
                      onClick={() => toggleHourSlot(hour)}
                      className={`py-3 px-4 rounded-xl text-xs font-mono font-medium transition-all border text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        isActive
                          ? "border-gold-500 bg-gold-950/20 text-gold-300 shadow-[0_0_12px_rgba(197,168,128,0.15)]"
                          : "border-white/5 bg-transparent text-gray-500 hover:border-white/10 hover:text-gray-300"
                      }`}
                    >
                      <span className="text-[13px] tracking-wider">{hour}</span>
                      <span className={`text-[8px] font-mono tracking-widest uppercase ${isActive ? "text-gold-400" : "text-gray-600"}`}>
                        {isActive ? "Ativo" : "Pausa"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products & Services Offered */}
            <div className="glass-panel p-6 rounded-2xl border-gold-glow border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 mb-4 gap-3">
                <h3 className="font-serif text-lg text-gold-300 uppercase tracking-wider flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-gold-400" /> Produtos & Serviços Prestados
                </h3>
                <button
                  id="barber-toggle-add-service-btn"
                  type="button"
                  onClick={() => setShowAddService(!showAddService)}
                  className="px-3.5 py-1.5 rounded-lg border border-gold-500/20 bg-gold-950/25 text-gold-400 hover:bg-gold-500 hover:text-black hover:border-gold-400 text-[10px] font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar Novo Produto / Serviço
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Gerencie quais produtos e rituais de estética você aceita prestar. Apenas rituais marcados abaixo serão oferecidos aos clientes no momento de agendamento em seu perfil.
              </p>

              {/* Add Custom Service Form */}
              <AnimatePresence>
                {showAddService && (
                  <motion.form
                    id="new-service-form"
                    onSubmit={handleAddCustomService}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-5 rounded-xl border border-gold-500/15 bg-gold-950/10 space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-gold-400 mb-2 border-b border-white/5 pb-1.5">
                      <Plus className="w-4 h-4 text-gold-400" />
                      <span className="text-[11px] font-mono uppercase tracking-widest font-semibold">Novo Ritual Vanguard</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono mb-1.5">
                          Nome do Serviço / Produto
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Alinhamento de Fios Prime"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="w-full bg-black/50 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono mb-1.5">
                          Preço do Ritual (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="Ex: 150.00"
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          className="w-full bg-black/50 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500/40 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono mb-1.5">
                          Duração Média (Minutos)
                        </label>
                        <select
                          value={newServiceDuration}
                          onChange={(e) => setNewServiceDuration(e.target.value)}
                          className="w-full bg-black/50 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-200 focus:outline-none focus:border-gold-500/40 font-mono cursor-pointer"
                        >
                          <option value="15">15 Minutos</option>
                          <option value="30">30 Minutos</option>
                          <option value="45">45 Minutos</option>
                          <option value="60">1h (60 Min)</option>
                          <option value="75">1h15 (75 Min)</option>
                          <option value="90">1h30 (90 Min)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono mb-1.5">
                          Breve Descrição Sensoriais
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={120}
                          placeholder="Ex: Rápido alinhamento capilar com óleos premium de argan."
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          className="w-full bg-black/50 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500/40"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 justify-end pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowAddService(false)}
                        className="px-3.5 py-1.5 rounded-lg border border-white/5 text-gray-400 text-[10px] font-mono tracking-wider uppercase hover:bg-white/[0.04] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingService}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 text-black text-[10px] font-mono tracking-wider font-semibold uppercase hover:shadow-[0_4px_15px_rgba(197,168,128,0.2)] cursor-pointer disabled:opacity-50"
                      >
                        {savingService ? "Cadastrando..." : "Confirmar Criação"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Service Cards List */}
              <div className="space-y-3.5">
                {allServices.map(service => {
                  const isChecked = selectedServices.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleServiceOffer(service.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                        isChecked
                          ? "border-gold-500/40 bg-gold-950/5 font-semibold text-gradient-gold"
                          : "border-white/5 bg-transparent hover:border-white/10"
                      }`}
                    >
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // toggled via parent div click
                          className="w-4 h-4 rounded border-gray-600 text-gold-500 focus:ring-gold-500 focus:ring-opacity-25 bg-neutral-900 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className={`text-xs font-semibold tracking-wider font-mono ${isChecked ? "text-gold-300" : "text-gray-300"}`}>
                            {service.name.toUpperCase()}
                          </h4>
                          <span className="text-[11px] font-mono text-gold-400 font-bold">
                            R$ {service.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-gray-500 mt-1 pl-0.5 leading-relaxed font-sans">
                          {service.description}
                        </p>
                        <div className="mt-2.5 flex gap-2 items-center text-[9px] font-mono uppercase tracking-widest text-gold-400/60 pl-0.5">
                          <Clock className="w-3.5 h-3.5" /> Duração: {service.durationMin} Minutos
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save All service settings trigger */}
              <div className="mt-6 border-t border-white/5 pt-5 text-right">
                <button
                  id="barber-save-services-btn"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-6 py-3.5 bg-gradient-to-r from-gold-600 to-gold-400 border border-gold-300/20 rounded-xl text-black font-semibold text-xs tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer ml-auto disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-black" /> Salvar Agenda & Serviços
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
}
