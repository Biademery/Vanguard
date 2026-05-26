/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Scissors, Mail, Lock, User, UserCheck, Shield, Sparkles, AlertCircle } from "lucide-react";
import { api } from "../lib/api.js";
import { UserProfile } from "../types.js";

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"customer" | "barber">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const user = await api.login(email, password);
        onAuthSuccess(user);
      } else {
        if (name.trim().length === 0) {
          throw new Error("Por favor, preencha o campo de nome.");
        }
        const user = await api.register(name, email, password, role);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro inesperado na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill fields for easy evaluation and access (Seeded barbers have password: "vanguard123")
  const fillBarberDemo = () => {
    setIsLogin(true);
    setEmail("diego@vanguard.com");
    setPassword("vanguard123");
    setRole("barber");
  };

  const fillCustomerDemo = () => {
    setIsLogin(true);
    setEmail("geraldo@vanguard.com");
    setPassword("vanguard123");
    setRole("customer");
  };

  return (
    <div id="auth-container" className="min-h-screen bg-radial-luxury flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Gold Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Containercard */}
      <motion.div 
        id="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl border-gold-glow border relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-950/45 border border-gold-500/20 mb-4 shadow-[0_0_15px_rgba(197,168,128,0.1)]">
            <Scissors className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="font-serif text-4xl text-gradient-gold tracking-widest uppercase mb-2">
            VANGUARD
          </h1>
          <p className="text-xs text-gold-300/60 uppercase tracking-widest font-mono">
            Grooming & Corporate Intellect
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 mb-6 relative">
          <button
            id="tab-btn-login"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-3 text-center text-sm font-medium tracking-wider uppercase transition-colors relative ${isLogin ? "text-gold-400" : "text-gray-400 hover:text-gray-200"}`}
          >
            Acessar Conta
            {isLogin && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-600 to-gold-400" />
            )}
          </button>
          <button
            id="tab-btn-register"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-3 text-center text-sm font-medium tracking-wider uppercase transition-colors relative ${!isLogin ? "text-gold-400" : "text-gray-400 hover:text-gray-200"}`}
          >
            Cadastrar-se
            {!isLogin && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-600 to-gold-400" />
            )}
          </button>
        </div>

        {/* Demo Fast Access Buttons */}
        <div className="flex gap-2 justify-center mb-6">
          <button
            id="btn-demo-barber"
            type="button"
            onClick={fillBarberDemo}
            className="px-3 py-1 text-[10px] font-mono tracking-wider uppercase bg-gold-950/30 text-gold-400 outline outline-1 outline-gold-600/30 rounded-md hover:outline-gold-400/50 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3 h-3" /> Barber Demo
          </button>
          <button
            id="btn-demo-customer"
            type="button"
            onClick={fillCustomerDemo}
            className="px-3 py-1 text-[10px] font-mono tracking-wider uppercase bg-gold-950/30 text-gold-400 outline outline-1 outline-gold-600/30 rounded-md hover:outline-gold-400/50 transition-all flex items-center gap-1 cursor-pointer"
          >
            <UserCheck className="w-3 h-3" /> Customer Demo
          </button>
        </div>

        {/* Error message */}
        {error && (
          <motion.div 
            id="auth-error-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-950/25 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* USER NAME - Only for Register */}
          {!isLogin && (
            <div id="inp-grp-name">
              <label htmlFor="reg-name" className="block text-[11px] uppercase tracking-wider text-gold-300/40 mb-1.5 font-mono">
                Nome do Cavalheiro
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gold-300/30">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 font-sans focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div id="inp-grp-email">
            <label htmlFor="auth-email" className="block text-[11px] uppercase tracking-wider text-gold-300/40 mb-1.5 font-mono">
              E-mail Corporativo / Pessoal
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gold-300/30">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="nome@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 font-sans focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div id="inp-grp-pass">
            <label htmlFor="auth-pass" className="block text-[11px] uppercase tracking-wider text-gold-300/40 mb-1.5 font-mono">
              Senha Secreta
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gold-300/30">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-pass"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 font-sans focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
              />
            </div>
          </div>

          {/* ROLE SELECTOR - Only for Register */}
          {!isLogin && (
            <div id="inp-grp-role">
              <label className="block text-[11px] uppercase tracking-wider text-gold-300/40 mb-2 font-mono">
                Selecione Seu Perfil de Acesso
              </label>
              <div className="flex gap-3">
                <button
                  id="btn-role-customer"
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 py-3 px-4 rounded-xl border text-xs text-center transition-all flex flex-col items-center gap-1 font-mono uppercase tracking-wider cursor-pointer ${role === "customer" ? "border-gold-400 bg-gold-950/20 text-gold-300" : "border-white/5 bg-transparent text-gray-400 hover:border-white/10"}`}
                >
                  <UserCheck className="w-5 h-5 mb-1 text-gold-500" />
                  Cliente
                </button>
                <button
                  id="btn-role-barber"
                  type="button"
                  onClick={() => setRole("barber")}
                  className={`flex-1 py-3 px-4 rounded-xl border text-xs text-center transition-all flex flex-col items-center gap-1 font-mono uppercase tracking-wider cursor-pointer ${role === "barber" ? "border-gold-400 bg-gold-950/20 text-gold-300" : "border-white/5 bg-transparent text-gray-400 hover:border-white/10"}`}
                >
                  <Shield className="w-5 h-5 mb-1 text-gold-500" />
                  Barbeiro
                </button>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 border border-gold-300/30 rounded-xl text-black font-semibold text-sm tracking-wider uppercase shadow-[0_4px_30px_rgba(197,168,128,0.15)] hover:shadow-[0_4px_30px_rgba(197,168,128,0.3)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 fill-black" />
                {isLogin ? "Acessar o Luxo" : "Aderir ao Vanguard"}
              </span>
            )}
          </button>
        </form>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-500 font-sans">
            Acesso encriptado via tokens de autorização seguros SSL.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
