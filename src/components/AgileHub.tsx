/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  CornerDownRight, 
  TrendingUp, 
  Activity, 
  Zap,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Filter
} from "lucide-react";

interface Task {
  id: number;
  activity: string;
  role: string;
  status: "Concluída" | "Pendente" | "A Fazer";
  sprint: string;
  priority: "Alta" | "Média" | "Baixa";
  effort: number;  // Story points
  category: "Front-end" | "Back-end" | "UX/UI" | "Product" | "Scrum";
  description: string;
}

const AGILE_TASKS: Task[] = [
  {
    id: 1,
    activity: "Mapeamento do Escopo MVP e Backlog inicial",
    role: "Kenji",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Alta",
    effort: 5,
    category: "Product",
    description: "Mapear jornadas, listar funcionalidades essenciais e criar backlog inicial."
  },
  {
    id: 2,
    activity: "Definição da User Story: Cadastro e Login",
    role: "Kenji",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Alta",
    effort: 3,
    category: "Product",
    description: "Definir regras, validações e critérios de aceite para entrada de usuários."
  },
  {
    id: 3,
    activity: "Documentação das Regras de Horários",
    role: "Kenji",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Alta",
    effort: 3,
    category: "Product",
    description: "Documentar lógica de calendário, intervalos de 45 min e prevenção de conflitos."
  },
  {
    id: 4,
    activity: "Criação da Identidade Visual e Style Guide",
    role: "Reinaldo",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Alta",
    effort: 5,
    category: "UX/UI",
    description: "Definir paleta de cores, tipografia e montar o Style Guide inicial."
  },
  {
    id: 5,
    activity: "Desenho dos Wireframes: Login e Cadastro",
    role: "Reinaldo",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Média",
    effort: 3,
    category: "UX/UI",
    description: "Desenhar interfaces de baixa e alta fidelidade para fluxo de acesso."
  },
  {
    id: 6,
    activity: "Setup Inicial do Repositório e Roteamento",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Alta",
    effort: 3,
    category: "Front-end",
    description: "Inicializar React, configurar linter, estrutura de pastas e rotas."
  },
  {
    id: 7,
    activity: "Desenvolvimento dos Componentes Globais",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Média",
    effort: 5,
    category: "Front-end",
    description: "Criar botões, inputs e modais reutilizáveis baseados no design system."
  },
  {
    id: 8,
    activity: "Setup do Ambiente e Framework (Docker)",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Alta",
    effort: 5,
    category: "Back-end",
    description: "Inicializar Spring Boot / Express e configurar ambiente isolado com Docker."
  },
  {
    id: 9,
    activity: "Modelagem de Banco de Dados (PostgreSQL / Firestore)",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Alta",
    effort: 8,
    category: "Back-end",
    description: "Estruturar tabelas no PostgreSQL (Users, Barbers, Appointments) e migrations."
  },
  {
    id: 10,
    activity: "Configuração do fluxo no Trello",
    role: "Rafael",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Baixa",
    effort: 2,
    category: "Scrum",
    description: "Criar quadro, colunas, labels e adicionar membros da equipe."
  },
  {
    id: 11,
    activity: "Facilitação da Sprint Planning 1 e DoD",
    role: "Rafael",
    status: "Concluída",
    sprint: "Sprint 1",
    priority: "Média",
    effort: 2,
    category: "Scrum",
    description: "Conduzir planejamento e definir o critério de 'Pronto' (Definition of Done)."
  },
  {
    id: 12,
    activity: "UAT: Homologação de Login e Perfis",
    role: "Kenji",
    status: "Concluída",
    sprint: "Sprint 2",
    priority: "Alta",
    effort: 3,
    category: "Product",
    description: "Testar fluxo de cadastro com dados reais e auditar a interface."
  },
  {
    id: 13,
    activity: "Construção das Telas de Login e Cadastro",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 2",
    priority: "Alta",
    effort: 5,
    category: "Front-end",
    description: "Codificar interfaces estáticas baseadas no protótipo de alta fidelidade."
  },
  {
    id: 14,
    activity: "Conexão com API de Autenticação",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 2",
    priority: "Alta",
    effort: 5,
    category: "Front-end",
    description: "Integrar requisições POST, salvar token JWT e proteger rotas privadas."
  },
  {
    id: 15,
    activity: "Desenvolvimento da API de Autenticação (JWT)",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 2",
    priority: "Alta",
    effort: 5,
    category: "Back-end",
    description: "Implementar encriptação de senhas, endpoint de login e validação JWT."
  },
  {
    id: 16,
    activity: "Criação do CRUD de Usuários e Barbeiros",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 2",
    priority: "Alta",
    effort: 5,
    category: "Back-end",
    description: "Desenvolver endpoints para criação e consulta de perfis do sistema."
  },
  {
    id: 17,
    activity: "Condução de Dailies e Remoção de Impedimentos",
    role: "Rafael",
    status: "Concluída",
    sprint: "Sprint 2",
    priority: "Baixa",
    effort: 2,
    category: "Scrum",
    description: "Facilitar reuniões diárias e remover bloqueios técnicos da equipe."
  },
  {
    id: 18,
    activity: "Protótipo de Alta Fidelidade: Agendamento",
    role: "Reinaldo",
    status: "Concluída",
    sprint: "Sprint 3",
    priority: "Média",
    effort: 5,
    category: "UX/UI",
    description: "Desenhar calendário, horários e tela de confirmação (Mobile First)."
  },
  {
    id: 19,
    activity: "Handoff de Assets para Desenvolvimento",
    role: "Reinaldo",
    status: "Concluída",
    sprint: "Sprint 3",
    priority: "Baixa",
    effort: 2,
    category: "UX/UI",
    description: "Exportar logos, ícones e especificações técnicas para o Front-end."
  },
  {
    id: 20,
    activity: "Desenvolvimento do Calendário e Seleção",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 3",
    priority: "Alta",
    effort: 5,
    category: "Front-end",
    description: "Implementar interface interativa para escolha de dias e horários livres."
  },
  {
    id: 21,
    activity: "Integração do Fluxo de Agendamento",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 3",
    priority: "Alta",
    effort: 5,
    category: "Front-end",
    description: "Consumir endpoints para buscar horários livres e confirmar marcações."
  },
  {
    id: 22,
    activity: "Desenvolvimento da Lógica de Disponibilidade",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 3",
    priority: "Alta",
    effort: 5,
    category: "Back-end",
    description: "Criar algoritmo que calcula os slots vazios subtraindo os já agendados."
  },
  {
    id: 23,
    activity: "Criação dos Endpoints de Agendamento",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 3",
    priority: "Alta",
    effort: 5,
    category: "Back-end",
    description: "Efetivar reserva no banco validando regras de antecedência mínima."
  },
  {
    id: 24,
    activity: "Monitoramento de Velocidade da Equipe",
    role: "Rafael",
    status: "Concluída",
    sprint: "Sprint 3",
    priority: "Baixa",
    effort: 2,
    category: "Scrum",
    description: "Acompanhar o fluxo de entregas do Back-end para o Front-end."
  },
  {
    id: 25,
    activity: "Definição da User Story: Dashboard de Métricas",
    role: "Kenji",
    status: "Concluída",
    sprint: "Sprint 4",
    priority: "Média",
    effort: 3,
    category: "Product",
    description: "Definir requisitos para visão de cortes do dia e faturamento semanal."
  },
  {
    id: 26,
    activity: "Protótipo do Dashboard do Barbeiro",
    role: "Reinaldo",
    status: "Concluída",
    sprint: "Sprint 4",
    priority: "Média",
    effort: 5,
    category: "UX/UI",
    description: "Desenhar painel administrativo e visão temporal da agenda diária."
  },
  {
    id: 27,
    activity: "Desenvolvimento Front-end do Dashboard",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 4",
    priority: "Alta",
    effort: 8,
    category: "Front-end",
    description: "Montar cards e gráficos com dados integrados da rota de analytics."
  },
  {
    id: 28,
    activity: "Otimização de Queries Analíticas no BD",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 4",
    priority: "Alta",
    effort: 8,
    category: "Back-end",
    description: "Otimizar consultas para calcular faturamento e métricas diárias."
  },
  {
    id: 29,
    activity: "Configuração do Sistema de Notificação",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 4",
    priority: "Média",
    effort: 5,
    category: "Back-end",
    description: "Configurar SMTP e disparar e-mail de confirmação pós-agendamento."
  },
  {
    id: 30,
    activity: "Facilitação de Retrospectiva da Equipe",
    role: "Rafael",
    status: "Concluída",
    sprint: "Sprint 4",
    priority: "Baixa",
    effort: 2,
    category: "Scrum",
    description: "Conduzir cerimônia para levantar melhorias no processo de trabalho."
  },
  {
    id: 31,
    activity: "Gestão de Risco e Controle de Escopo",
    role: "Rafael",
    status: "Concluída",
    sprint: "Sprint 4",
    priority: "Alta",
    effort: 3,
    category: "Scrum",
    description: "Blindar a equipe contra scope creep e mudanças não planejadas."
  },
  {
    id: 32,
    activity: "Condução de Feature Freeze e Testes E2E",
    role: "Kenji",
    status: "Concluída",
    sprint: "Sprint 5",
    priority: "Alta",
    effort: 5,
    category: "Product",
    description: "Congelar escopo e realizar testes de ponta a ponta simulando uso real."
  },
  {
    id: 33,
    activity: "Design de Casos Extremos e Telas de Erro",
    role: "Reinaldo",
    status: "Concluída",
    sprint: "Sprint 5",
    priority: "Baixa",
    effort: 3,
    category: "UX/UI",
    description: "Desenhar telas de agenda vazia e feedbacks visuais de erro."
  },
  {
    id: 34,
    activity: "Review de Fidelidade de Interface",
    role: "Reinaldo",
    status: "Concluída",
    sprint: "Sprint 5",
    priority: "Baixa",
    effort: 3,
    category: "UX/UI",
    description: "Auditar fidelidade visual do código codificado contra o Figma."
  },
  {
    id: 35,
    activity: "Refinamento de Responsividade Mobile",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 5",
    priority: "Média",
    effort: 5,
    category: "Front-end",
    description: "Ajustar layout mobile e garantir exibição amigável de falhas."
  },
  {
    id: 36,
    activity: "Correção de Bugs (Front-end)",
    role: "Bia",
    status: "Concluída",
    sprint: "Sprint 5",
    priority: "Alta",
    effort: 5,
    category: "Front-end",
    description: "Resolver falhas de interface e integração reportadas no UAT."
  },
  {
    id: 37,
    activity: "Correção de Bugs e Otimização (Back-end)",
    role: "Samuel",
    status: "Concluída",
    sprint: "Sprint 5",
    priority: "Alta",
    effort: 5,
    category: "Back-end",
    description: "Revisar logs, adicionar índices e corrigir falhas da API no UAT."
  },
  {
    id: 38,
    activity: "Coordenação da Esteira de Bugs",
    role: "Rafael",
    status: "Concluída",
    sprint: "Sprint 5",
    priority: "Alta",
    effort: 3,
    category: "Scrum",
    description: "Coordenar priorização e fluxo rápido de resolução na semana de QA."
  },
  {
    id: 39,
    activity: "Sign-off Final e Planejamento da V2",
    role: "Kenji",
    status: "Pendente",
    sprint: "Sprint 6",
    priority: "Média",
    effort: 3,
    category: "Product",
    description: "Aprovação final do MVP e planejamento de melhorias futuras."
  },
  {
    id: 40,
    activity: "Preparação de Assets Visuais de Lançamento",
    role: "Reinaldo",
    status: "Pendente",
    sprint: "Sprint 6",
    priority: "Baixa",
    effort: 3,
    category: "UX/UI",
    description: "Preparar mockups e recursos gráficos para divulgação do app."
  },
  {
    id: 41,
    activity: "Deploy do App em Produção",
    role: "Bia",
    status: "Pendente",
    sprint: "Sprint 6",
    priority: "Alta",
    effort: 5,
    category: "Front-end",
    description: "Configurar variáveis e realizar build/deploy na plataforma web."
  },
  {
    id: 42,
    activity: "Deploy da API e Banco de Dados",
    role: "Samuel",
    status: "Pendente",
    sprint: "Sprint 6",
    priority: "Alta",
    effort: 5,
    category: "Back-end",
    description: "Provisionar infraestrutura e subir banco de dados em nuvem."
  },
  {
    id: 43,
    activity: "Facilitação da Retrospectiva Final",
    role: "Rafael",
    status: "Pendente",
    sprint: "Sprint 6",
    priority: "Baixa",
    effort: 2,
    category: "Scrum",
    description: "Fechar ciclo do projeto, documentando lições aprendidas."
  }
];

export default function AgileHub() {
  const [activeTab, setActiveTab] = useState<"board" | "priorities" | "devs">("board");
  
  // Filter variables
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [sprintFilter, setSprintFilter] = useState<string>("all");

  const filteredTasks = AGILE_TASKS.filter(task => {
    const matchesRole = roleFilter === "all" || task.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesCat = catFilter === "all" || task.category.toLowerCase() === catFilter.toLowerCase();
    const matchesSprint = sprintFilter === "all" || task.sprint.toLowerCase() === sprintFilter.toLowerCase();
    return matchesRole && matchesCat && matchesSprint;
  });

  // Calculate Metrics
  const totalEffort = AGILE_TASKS.reduce((acc, curr) => acc + curr.effort, 0);
  const completedTasks = AGILE_TASKS.filter(t => t.status === "Concluída");
  const completedEffort = completedTasks.reduce((acc, curr) => acc + curr.effort, 0);
  const completionPercentage = Math.round((completedTasks.length / AGILE_TASKS.length) * 100);

  // Grouped metrics by category for Priority and Effort report
  const categoriesList: ("Front-end" | "Back-end" | "UX/UI" | "Product" | "Scrum")[] = [
    "Front-end", "Back-end", "UX/UI", "Product", "Scrum"
  ];

  const getPriorityWeight = (p: string) => {
    if (p === "Alta") return 3;
    if (p === "Média") return 2;
    return 1;
  };

  // Sort by Priority (High to Low), then Effort (High to Low)
  const sortedReportTasks = [...filteredTasks].sort((a, b) => {
    const pA = getPriorityWeight(a.priority);
    const pB = getPriorityWeight(b.priority);
    if (pB !== pA) return pB - pA;
    return b.effort - a.effort;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-gold-400">CIÊNCIA DE METODOLOGIAS ÁGEIS</span>
          <h2 className="font-serif text-4xl text-gradient-gold tracking-tight mt-1">
            Scrumban Vanguard Hub
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Análise acadêmica do ciclo de vida do projeto (20/04 a 22/05) • {AGILE_TASKS.length} Atividades Mapeadas e Homologadas.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex rounded-xl bg-black/40 border border-white/5 p-1 shrink-0">
          <button
            id="hub-btn-board"
            onClick={() => setActiveTab("board")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === "board" ? "bg-gold-400 text-black font-bold" : "text-gray-400 hover:text-white"}`}
          >
            Quadro Scrumban
          </button>
          <button
            id="hub-btn-priorities"
            onClick={() => setActiveTab("priorities")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === "priorities" ? "bg-gold-400 text-black font-bold" : "text-gray-400 hover:text-white"}`}
          >
            Relatório de Prioridade & Esforço
          </button>
          <button
            id="hub-btn-devs"
            onClick={() => setActiveTab("devs")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === "devs" ? "bg-gold-400 text-black font-bold" : "text-gray-400 hover:text-white"}`}
          >
            Matriz de Engenheiros Fullstack
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-gold-400/10 rounded-xl text-gold-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Framework Ágil</p>
            <h4 className="text-lg font-bold text-gray-200 mt-0.5">Scrumban</h4>
            <p className="text-[10px] text-gold-300 font-mono">Sprints + Quadro de Fluxo</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl text-green-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Atividades Concluídas</p>
            <h4 className="text-lg font-bold text-green-400 mt-0.5">{completedTasks.length} / {AGILE_TASKS.length}</h4>
            <p className="text-[10px] text-gray-400 font-mono">{completionPercentage}% do backlog homologado</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Volume de Esforço (SP)</p>
            <h4 className="text-lg font-bold text-blue-400 mt-0.5">{completedEffort} / {totalEffort} SP</h4>
            <p className="text-[10px] text-gray-400 font-mono">Story Points estimados (Fibonacci)</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Janela Temporal</p>
            <h4 className="text-lg font-bold text-gray-200 mt-0.5">20/04 A 22/05</h4>
            <p className="text-[10px] text-purple-300 font-mono">6 Sprints Consecutivas</p>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gold-400" />
          <span className="text-xs uppercase font-mono text-gray-400">Filtros Ativos:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <select
            id="agile-role-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-1.5 px-3 bg-black/60 border border-white/5 rounded-lg text-xs font-mono text-gray-300 focus:outline-none focus:border-gold-500/35"
          >
            <option value="all">TODOS OS MEMBROS</option>
            <option value="bia">Bia (Fullstack Dev / Front Focus)</option>
            <option value="samuel">Samuel (Fullstack Dev / Back Focus)</option>
            <option value="kenji">Kenji (Product Owner / QA)</option>
            <option value="reinaldo">Reinaldo (UI/UX Designer)</option>
            <option value="rafael">Rafael (Scrum Master)</option>
          </select>

          {/* Category Filter */}
          <select
            id="agile-category-select"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="py-1.5 px-3 bg-black/60 border border-white/5 rounded-lg text-xs font-mono text-gray-300 focus:outline-none focus:border-gold-500/35"
          >
            <option value="all">TODAS AS DISCIPLINAS</option>
            <option value="front-end">Front-end</option>
            <option value="back-end">Back-end</option>
            <option value="ux/ui">UX/UI</option>
            <option value="product">Product Management</option>
            <option value="scrum">Scrum Delivery Core</option>
          </select>

          {/* Sprint Filter */}
          <select
            id="agile-sprint-select"
            value={sprintFilter}
            onChange={(e) => setSprintFilter(e.target.value)}
            className="py-1.5 px-3 bg-black/60 border border-white/5 rounded-lg text-xs font-mono text-gray-300 focus:outline-none focus:border-gold-500/35"
          >
            <option value="all">TODAS AS SPRINTS (1 - 6)</option>
            <option value="sprint 1">Sprint 1 (Concepção e Setup)</option>
            <option value="sprint 2">Sprint 2 (Autenticação)</option>
            <option value="sprint 3">Sprint 3 (Agendamento Core)</option>
            <option value="sprint 4">Sprint 4 (Dashboard & Métricas)</option>
            <option value="sprint 5">Sprint 5 (Estabilidade / Testes E2E)</option>
            <option value="sprint 6">Sprint 6 (Deploy & Launch)</option>
          </select>
        </div>
      </div>

      {/* CORE ACTIVE TABS */}
      
      {/* 1. KANBAN BOARD */}
      {activeTab === "board" && (
        <div id="agile-kanban-board" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMN A FAZER / BACKLOG */}
          <div className="bg-black/25 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-gray-300 font-bold">A Fazer / Planejado</h3>
              </div>
              <span className="px-2 py-0.5 bg-black/40 text-[10px] font-mono text-gray-400 rounded">
                {filteredTasks.filter(t => t.status === "A Fazer" || t.status === "Pendente").length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
              {filteredTasks.filter(t => t.status === "A Fazer" || t.status === "Pendente").map(task => (
                <KanbanCard key={task.id} task={task} />
              ))}
              {filteredTasks.filter(t => t.status === "A Fazer" || t.status === "Pendente").length === 0 && (
                <div className="text-center py-20 text-gray-600 text-xs font-mono uppercase">Vazio</div>
              )}
            </div>
          </div>

          {/* COLUMN IN PROGRESS */}
          <div className="bg-black/25 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-gray-300 font-bold">Em Curso / Sprint Ativa</h3>
              </div>
              <span className="px-2 py-0.5 bg-amber-950/40 text-[10px] font-mono text-amber-400 rounded">
                0
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
              <div className="text-center py-20 text-gray-600 text-xs font-sans italic p-4">
                Todas as tarefas das Sprints de 1 a 5 foram entregues com altíssimo rigor. Próximos itens dependem de release (Sprint 6).
              </div>
            </div>
          </div>

          {/* COLUMN COMPLETED */}
          <div className="bg-black/25 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-gray-300 font-bold">Entregue & Homologado (DoD)</h3>
              </div>
              <span className="px-2 py-0.5 bg-green-950/40 text-[10px] font-mono text-green-400 rounded">
                {filteredTasks.filter(t => t.status === "Concluída").length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
              {filteredTasks.filter(t => t.status === "Concluída").map(task => (
                <KanbanCard key={task.id} task={task} />
              ))}
              {filteredTasks.filter(t => t.status === "Concluída").length === 0 && (
                <div className="text-center py-20 text-gray-600 text-xs font-mono uppercase">Vazio</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. PRIORITIES & EFFORT REPORT (Teacher requested structure) */}
      {activeTab === "priorities" && (
        <div id="agile-priorities-report" className="glass-panel p-6 rounded-3xl border border-white/5">
          <div className="border-b border-white/5 pb-4 mb-6">
            <h3 className="font-serif text-2xl text-gold-200">Relatório Científico de Atividades Mapeadas</h3>
            <p className="text-xs text-gray-400 mt-1">
              Ordenado hierarquicamente por **Prioridade (Alta → Baixa)** e pontuado via **Esforço estimado (Métrica de Fibonacci de 1 a 13)**.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 uppercase font-mono tracking-wider text-gold-400/80">
                  <th className="py-3 px-4">REF ID</th>
                  <th className="py-3 px-4">Disciplina / Categoria</th>
                  <th className="py-3 px-4">Atividade / Entrega Realizada</th>
                  <th className="py-3 px-4 text-center">Sprint</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4 text-center">Prioridade</th>
                  <th className="py-3 px-4 text-center">Esforço (DoD SP)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedReportTasks.map((task, index) => {
                  const isHigh = task.priority === "Alta";
                  const isMid = task.priority === "Média";
                  
                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-500">#{task.id}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          task.category === 'Front-end' ? 'bg-blue-950 text-blue-400 border border-blue-500/20' :
                          task.category === 'Back-end' ? 'bg-purple-950 text-purple-400 border border-purple-500/20' :
                          task.category === 'UX/UI' ? 'bg-amber-950 text-amber-400 border border-amber-500/10' :
                          task.category === 'Product' ? 'bg-green-950 text-green-400 border border-green-500/10' :
                          'bg-red-950 text-red-400 border border-red-500/10'
                        }`}>
                          {task.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-200">
                        <div>
                          <p>{task.activity}</p>
                          <p className="text-[10px] text-gray-500 font-sans font-normal mt-0.5">{task.description}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-gray-400">{task.sprint}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-300">{task.role}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          isHigh ? 'bg-red-950/60 text-red-400 border border-red-500/25' :
                          isMid ? 'bg-amber-950/60 text-amber-400 border border-amber-500/25' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-300">{task.effort} SP</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                          task.status === "Concluída" ? "bg-green-950 text-green-400" : "bg-zinc-800 text-zinc-500"
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. EXPERT FULLSTACK DEVS PROFILE MATRIX */}
      {activeTab === "devs" && (
        <div id="agile-devs-matrix" className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="font-serif text-2xl text-gold-200 mb-2">Estrutura de Equipe Unificada (2 Fullstack Developers + Key Stakeholders)</h3>
            <p className="text-xs text-gray-400">Atribuindo responsabilidades, velocidade de entrega e Story Points acumulados por profissional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* FULLSTACK DEV 1: Bia */}
            <div className="glass-panel p-6 rounded-2xl border border-blue-500/25">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-serif text-xl text-blue-400 font-bold border border-blue-500/20">
                  Bia
                </div>
                <div>
                  <h4 className="font-serif text-lg text-white">Bia (Engenheira Fullstack II)</h4>
                  <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Foco Front-end / Integrações API</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400">Tarefas Homologadas:</span>
                  <span className="text-white">8 Atividades</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400">Velocidade Acumulada:</span>
                  <span className="text-white">38 Story Points</span>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500 mb-2">Principais Entregas:</p>
                  <ul className="space-y-1 text-gray-300 font-sans list-disc list-inside">
                    <li>Setup Inicial do Repositório React, Vite e Tailwind CSS</li>
                    <li>Desenvolvimento de Componentes Globais & Telas de Login/Cadastro</li>
                    <li>Configuração da Conexão com API e gestão de tokens JWT em localStorage</li>
                    <li>Calendário e Grade Horária Interativa com limite de 14 dias</li>
                    <li>Dashboard Executivo para controle operacional por barbeiro</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FULLSTACK DEV 2: Samuel */}
            <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center font-serif text-xl text-purple-400 font-bold border border-purple-500/20">
                  SM
                </div>
                <div>
                  <h4 className="font-serif text-lg text-white">Samuel (Engenheiro Fullstack II)</h4>
                  <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Foco Back-end / DB / Cloud Ops</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400">Tarefas Homologadas:</span>
                  <span className="text-white">9 Atividades</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-gray-400">Velocidade Acumulada:</span>
                  <span className="text-white">51 Base Story Points</span>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500 mb-2">Principais Entregas:</p>
                  <ul className="space-y-1 text-gray-300 font-sans list-disc list-inside">
                    <li>Configuração do ambiente isolado de desenvolvimento (Docker)</li>
                    <li>Modelagem das tabelas do Postgresql e migrations do banco</li>
                    <li>Modelagem Fail-safe resiliente ao named databases do Firestore</li>
                    <li>Desenvolvimento do robusto servidor Express com encriptação bcrypt</li>
                    <li>Segurança JWT nas APIs restritas via bearer token middlewares</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* PRODUCT OWNER: Kenji */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center font-serif text-xl text-green-400 font-bold border border-green-500/20">
                  KJ
                </div>
                <div>
                  <h4 className="font-serif text-lg text-white">Kenji (Product Owner & QA)</h4>
                  <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest">Product owner / homologador</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Responsável direto por definir as User Stories, auditar critérios de aceitação e alinhar as tomadas de decisões técnicas aos objetivos comerciais do Vanguard Club. Garante a entrega do MVP alinhado às demandas do cliente.
              </p>
            </div>

            {/* SCRUM MASTER: Rafael */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center font-serif text-xl text-red-400 font-bold border border-red-500/20">
                  RF
                </div>
                <div>
                  <h4 className="font-serif text-lg text-white">Rafael (Scrum Master)</h4>
                  <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Agile Delivery Leader</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Líder responsável por estruturar as cerimônias Scrumban, organizar o fluxo de cartões no Trello, otimizar gargalos de desempenho da equipe e consolidar os relatórios métricos de velocidade de entrega e DoD.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Kanban Card representation component
function KanbanCard({ task }: { task: Task; key?: any }) {
  const isHigh = task.priority === "Alta";
  const isMid = task.priority === "Média";

  return (
    <div 
      id={`kanban-card-${task.id}`}
      className="p-3.5 bg-black/45 border border-white/5 hover:border-gold-500/15 rounded-xl transition-all relative overflow-hidden group shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="font-mono text-[9px] text-gray-500">#{task.id}</span>
        <span className={`px-2 py-0.5 rounded text-[8px] font-mono ${
          task.category === 'Front-end' ? 'bg-blue-950 text-blue-400' :
          task.category === 'Back-end' ? 'bg-purple-950 text-purple-400' :
          task.category === 'UX/UI' ? 'bg-amber-950 text-amber-400' :
          task.category === 'Product' ? 'bg-green-950 text-green-400' :
          'bg-red-950 text-red-500'
        }`}>
          {task.category}
        </span>
      </div>

      <h5 className="text-xs font-semibold text-gray-200 group-hover:text-gold-300 transition-colors leading-relaxed">
        {task.activity}
      </h5>

      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-3 text-[10px]">
        {/* Priority indication badge */}
        <span className={`px-1.5 py-0.5 rounded-[4px] font-bold font-mono text-[8px] ${
          isHigh ? 'bg-red-950 text-red-400' :
          isMid ? 'bg-amber-950 text-amber-400' :
          'bg-slate-800 text-slate-300'
        }`}>
          {task.priority}
        </span>

        {/* Story point indicators */}
        <span className="font-mono text-gold-400/80">
          {task.effort} SP
        </span>

        {/* Developer Assing badge */}
        <span className="font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
          {task.role}
        </span>
      </div>
    </div>
  );
}
