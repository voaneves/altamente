import React from 'react';
import { Zap, Bell, Settings } from 'lucide-react';
import { AppUser } from '../../hooks/useAuth';
import { AppNotification } from '../NotificationCenter';

interface MobileHeaderProps {
  appUser: AppUser;
  notifications: AppNotification[];
  setShowNotifications: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const MobileHeader = React.memo(function MobileHeader({ appUser, notifications, setShowNotifications, activeTab, setActiveTab }: MobileHeaderProps) {
  return (
    <header className="md:hidden bg-app-surface/80 backdrop-blur-md px-6 pb-4 shadow-sm sticky top-0 z-30 flex justify-between items-center border-b border-app-border/60" style={{ paddingTop: 'calc(1rem + var(--sat))' }}>
      <div>
        <h1 className="text-xl font-black text-app-text tracking-tight flex items-center gap-2">
          <Zap className="text-app-accent" fill="currentColor" size={20} />
          Altamente
        </h1>
        <p className="text-[10px] text-app-text-muted mt-1 font-bold uppercase tracking-widest">
          {appUser.role === 'professor' ? 'Área do Professor' : appUser.role === 'admin' ? 'Área da Coordenação' : 'Área da Família'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowNotifications(true)}
          aria-label="Abrir notificações"
          className="w-10 h-10 rounded-full bg-app-input flex items-center justify-center text-app-text-muted hover:text-app-accent hover:bg-app-accent/10 transition-all duration-300 relative"
        >
          <Bell size={18} />
          {notifications.some(n => !n.read) && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-app-accent rounded-full"></span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('configuracoes')}
          aria-label="Configurações"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            activeTab === 'configuracoes' 
              ? 'bg-app-accent text-app-accent-text shadow-md' 
              : 'bg-app-input text-app-text-muted hover:text-app-accent hover:bg-app-accent/10'
          }`}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
});
