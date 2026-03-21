import React from 'react';
import { Zap, PlusCircle, History, Bell, Settings, Activity, Shield, ClipboardList, User } from 'lucide-react';
import { AppUser } from '../../hooks/useAuth';

interface DesktopSidebarProps {
  appUser: AppUser;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const DesktopSidebar = React.memo(function DesktopSidebar({ appUser, activeTab, setActiveTab }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-72 bg-app-surface border-r border-app-border/60 h-screen sticky top-0 z-20 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-app-accent/5 to-transparent pointer-events-none"></div>
      <div className="p-8 pb-6 relative z-10">
        <h1 className="text-3xl font-black text-app-text tracking-tight flex items-center gap-3">
          <div className="p-2 bg-app-accent/10 rounded-xl text-app-accent">
            <Zap fill="currentColor" size={24} />
          </div>
          Altamente
        </h1>
        <p className="text-xs text-app-text-muted mt-3 font-bold uppercase tracking-widest ml-14">Rastreamento Inclusivo</p>
      </div>
      
      <nav className="flex-1 px-6 space-y-3 mt-4 relative z-10">
        {appUser.role === 'professor' ? (
          <>
            <button 
              onClick={() => setActiveTab('registrar')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'registrar' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <PlusCircle size={22} />
              <span>Registrar</span>
            </button>
            <button 
              onClick={() => setActiveTab('historico')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'historico' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <History size={22} />
              <span>Histórico</span>
            </button>
            <button 
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'configuracoes' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <Settings size={22} />
              <span>Configurações</span>
            </button>
          </>
        ) : appUser.role === 'admin' ? (
          <>
            <button 
              onClick={() => setActiveTab('dashboard_admin')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'dashboard_admin' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <Activity size={22} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'admin' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <Shield size={22} />
              <span>Administração</span>
            </button>
            <button 
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'configuracoes' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <Settings size={22} />
              <span>Configurações</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setActiveTab('visao_pais')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'visao_pais' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <ClipboardList size={22} />
              <span>Visão Pais</span>
            </button>
            <button 
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                activeTab === 'configuracoes' ? 'bg-app-accent text-app-accent-text font-semibold shadow-md shadow-app-accent/20 translate-x-1' : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text'
              }`}
            >
              <Settings size={22} />
              <span>Configurações</span>
            </button>
          </>
        )}
      </nav>

      <div className="p-6 border-t border-app-border/60 relative z-10">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-app-input border border-app-border/60 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-app-surface border border-app-border/60 flex items-center justify-center text-app-accent shrink-0 shadow-sm">
            <User size={18} />
          </div>
          <div className="truncate">
            <p className="font-bold text-app-text truncate">{appUser.name}</p>
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest mt-0.5">{appUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
});
