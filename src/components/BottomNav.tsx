import React from 'react';
import { PlusCircle, History, ClipboardList, Activity, Shield } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, role }: { activeTab: string, setActiveTab: (tab: any) => void, role: string }) {
  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center pointer-events-none" style={{ paddingBottom: 'var(--sab)' }}>
      <nav className="bg-app-surface/90 backdrop-blur-md border border-app-border/50 shadow-xl rounded-full flex p-2 pointer-events-auto max-w-sm w-full">
        {role === 'professor' ? (
          <>
            <button 
              onClick={() => setActiveTab('registrar')}
              className={`flex flex-col items-center justify-center py-2 px-2 w-1/2 rounded-full transition-all duration-200 ${
                activeTab === 'registrar' ? 'bg-app-accent text-app-accent-text shadow-md' : 'text-app-text-muted hover:text-app-text'
              }`}
            >
              <PlusCircle size={20} className="mb-1" />
              <span className="text-[9px] font-semibold tracking-wide uppercase">Registrar</span>
            </button>
            <button 
              onClick={() => setActiveTab('historico')}
              className={`flex flex-col items-center justify-center py-2 px-2 w-1/2 rounded-full transition-all duration-200 ${
                activeTab === 'historico' ? 'bg-app-accent text-app-accent-text shadow-md' : 'text-app-text-muted hover:text-app-text'
              }`}
            >
              <History size={20} className="mb-1" />
              <span className="text-[9px] font-semibold tracking-wide uppercase">Histórico</span>
            </button>
          </>
        ) : role === 'admin' ? (
          <>
            <button 
              onClick={() => setActiveTab('dashboard_admin')}
              className={`flex flex-col items-center justify-center py-2 px-2 w-1/2 rounded-full transition-all duration-200 ${
                activeTab === 'dashboard_admin' ? 'bg-app-accent text-app-accent-text shadow-md' : 'text-app-text-muted hover:text-app-text'
              }`}
            >
              <Activity size={20} className="mb-1" />
              <span className="text-[9px] font-semibold tracking-wide uppercase">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center justify-center py-2 px-2 w-1/2 rounded-full transition-all duration-200 ${
                activeTab === 'admin' ? 'bg-app-accent text-app-accent-text shadow-md' : 'text-app-text-muted hover:text-app-text'
              }`}
            >
              <Shield size={20} className="mb-1" />
              <span className="text-[9px] font-semibold tracking-wide uppercase">Admin</span>
            </button>
          </>
        ) : (
          <button 
            onClick={() => setActiveTab('visao_pais')}
            className={`flex flex-col items-center justify-center py-2 px-4 w-full rounded-full transition-all duration-200 ${
              activeTab === 'visao_pais' ? 'bg-app-accent text-app-accent-text shadow-md' : 'text-app-text-muted hover:text-app-text'
            }`}
          >
            <ClipboardList size={20} className="mb-1" />
            <span className="text-[9px] font-semibold tracking-wide uppercase">Visão dos Pais</span>
          </button>
        )}
      </nav>
    </div>
  );
}
