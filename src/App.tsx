/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Scissors, Layers, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "./lib/api.js";
import { UserProfile } from "./types.js";
import AuthScreen from "./components/AuthScreen.js";
import CustomerPanel from "./components/CustomerPanel.js";
import BarberPanel from "./components/BarberPanel.js";
import AgileHub from "./components/AgileHub.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [viewingAgileHub, setViewingAgileHub] = useState(false);

  useEffect(() => {
    // Check if user session already exists in localStorage
    const storedUser = api.getCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setAppReady(true);
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setViewingAgileHub(false);
  };

  if (!appReady) {
    return (
      <div className="min-h-screen bg-radial-luxury flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-gold-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xs uppercase font-mono tracking-widest text-gold-500">Inicializando Vanguard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radial-luxury font-sans select-none text-gray-200 flex flex-col justify-between relative overflow-hidden">
      
      {/* Persistent Decorative Brand Header */}
      <header id="vanguard-header" className="border-b border-white/5 py-4 bg-black/40 relative z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scissors className="w-5 h-5 text-gold-400" />
            <span className="font-serif text-lg tracking-[0.25em] text-gradient-gold font-bold">VANGUARD</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="toggle-agile-view"
              onClick={() => setViewingAgileHub(!viewingAgileHub)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold-500/20 bg-gold-400/5 text-[10px] font-mono uppercase tracking-wider text-gold-400 hover:bg-gold-400/20 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              {viewingAgileHub ? "Sistema Barbearia" : "Relatório & Cards Ágeis"}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-[9px] font-mono uppercase text-gold-400/80 tracking-widest">Premium Salon Hub</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-grow w-full relative">
        <AnimatePresence mode="wait">
          {viewingAgileHub ? (
            <motion.div
              key="agile-hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AgileHub />
            </motion.div>
          ) : !currentUser ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AuthScreen onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          ) : currentUser.role === "barber" ? (
            <motion.div
              key="barber"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <BarberPanel currentUser={currentUser} onLogout={handleLogout} />
            </motion.div>
          ) : (
            <motion.div
              key="customer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CustomerPanel currentUser={currentUser} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Corporate footer */}
      <footer id="vanguard-footer" className="border-t border-white/5 py-6 text-center text-gray-600 bg-black/20 text-[10px] font-mono uppercase tracking-[0.15em] relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Vanguard Luxury Barber Club Corp. Todos os direitos reservados.</p>
          <p className="text-gold-500/50">Corte com Estética, Decisão com Intelecto.</p>
        </div>
      </footer>

    </div>
  );
}
