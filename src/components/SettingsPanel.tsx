import React, { useState } from 'react';
import { Settings, User, Type, Moon, Sun, Eye, Save, LogOut } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { hapticSuccess, hapticError, hapticImpact } from '../utils/haptics';

interface SettingsPanelProps {
  appUser: { uid: string; name: string; role: string; filhos?: string[] };
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  fontSize: 'sm' | 'md' | 'lg';
  setFontSize: (value: 'sm' | 'md' | 'lg') => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  handleLogout: () => void;
}

export const SettingsPanel = React.memo(function SettingsPanel({
  appUser,
  isDarkMode,
  setIsDarkMode,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  showToast,
  handleLogout
}: SettingsPanelProps) {
  const [name, setName] = useState(appUser.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('O nome não pode estar vazio.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', appUser.uid), {
        name: name.trim()
      }, { merge: true });
      await hapticSuccess();
      showToast('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      await hapticError();
      showToast('Erro ao atualizar perfil.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-app-surface p-6 sm:p-8 rounded-[2rem] border border-app-border/60 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-app-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-app-text tracking-tight relative z-10">
          <div className="p-2.5 bg-app-accent/10 rounded-xl text-app-accent">
            <User size={24} />
          </div>
          Editar Perfil
        </h3>
        
        <form onSubmit={handleSaveProfile} className="relative z-10 space-y-5">
          <div>
            <label className="block text-sm font-bold text-app-text-muted mb-2">Nome de Exibição</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-app-input border border-app-border/60 rounded-2xl p-4 text-app-text focus:outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 transition-all duration-300 font-medium"
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSaving || name === appUser.name}
              className="bg-app-accent text-app-accent-text font-bold px-8 py-4 rounded-2xl hover:bg-app-accent-hover transition-all duration-300 active:scale-[0.98] flex items-center gap-2 shadow-md shadow-app-accent/20 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-app-surface p-6 sm:p-8 rounded-[2rem] border border-app-border/60 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-app-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-app-text tracking-tight relative z-10">
          <div className="p-2.5 bg-app-accent/10 rounded-xl text-app-accent">
            <Settings size={24} />
          </div>
          Acessibilidade e Aparência
        </h3>

        <div className="space-y-8 relative z-10">
          {/* Tema */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2">
              <Sun size={14} /> Tema Visual
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  hapticImpact();
                  setIsDarkMode(false);
                }}
                className={`p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-300 ${
                  !isDarkMode 
                    ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-sm scale-[1.02]' 
                    : 'bg-app-input border-app-border/60 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border'
                }`}
              >
                <Sun size={20} />
                <span className="font-bold">Claro</span>
              </button>
              <button
                onClick={() => {
                  hapticImpact();
                  setIsDarkMode(true);
                }}
                className={`p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-sm scale-[1.02]' 
                    : 'bg-app-input border-app-border/60 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border'
                }`}
              >
                <Moon size={20} />
                <span className="font-bold">Escuro</span>
              </button>
            </div>
          </div>

          {/* Alto Contraste */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2">
              <Eye size={14} /> Contraste
            </label>
            <button
              onClick={() => {
                hapticImpact();
                setHighContrast(!highContrast);
              }}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                highContrast 
                  ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-sm' 
                  : 'bg-app-input border-app-border/60 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border'
              }`}
            >
              <span className="font-bold flex items-center gap-3">
                <Eye size={20} />
                Modo de Alto Contraste
              </span>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${highContrast ? 'bg-app-accent' : 'bg-app-border'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${highContrast ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

          {/* Tamanho da Fonte */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2">
              <Type size={14} /> Tamanho da Fonte
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  hapticImpact();
                  setFontSize('sm');
                }}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  fontSize === 'sm' 
                    ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-sm scale-[1.02]' 
                    : 'bg-app-input border-app-border/60 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border'
                }`}
              >
                <Type size={16} />
                <span className="font-bold text-xs">Pequeno</span>
              </button>
              <button
                onClick={() => {
                  hapticImpact();
                  setFontSize('md');
                }}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  fontSize === 'md' 
                    ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-sm scale-[1.02]' 
                    : 'bg-app-input border-app-border/60 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border'
                }`}
              >
                <Type size={20} />
                <span className="font-bold text-sm">Médio</span>
              </button>
              <button
                onClick={() => {
                  hapticImpact();
                  setFontSize('lg');
                }}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  fontSize === 'lg' 
                    ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-sm scale-[1.02]' 
                    : 'bg-app-input border-app-border/60 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border'
                }`}
              >
                <Type size={24} />
                <span className="font-bold text-base">Grande</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-app-border/60">
        <button
          onClick={handleLogout}
          className="w-full bg-app-danger/10 text-app-danger font-bold px-8 py-4 rounded-2xl hover:bg-app-danger hover:text-white transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm"
        >
          <LogOut size={20} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
});
