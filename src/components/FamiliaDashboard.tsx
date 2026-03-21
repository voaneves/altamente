import React, { useState, useMemo } from 'react';
import { User, Clock } from 'lucide-react';
import { ProgressDashboard } from './ProgressDashboard';
import { RegistrosList } from './RegistrosList';

interface FamiliaDashboardProps {
  appUser: { role: string; filhos?: string[] };
  registros: any[]; // Replace with proper type if available
  setRegistroToEdit: (registro: any) => void;
}

export const FamiliaDashboard = React.memo(function FamiliaDashboard({ appUser, registros, setRegistroToEdit }: FamiliaDashboardProps) {
  const [alunoSelecionadoPai, setAlunoSelecionadoPai] = useState(appUser.filhos?.[0] || '');

  const registrosFiltradosPai = useMemo(() => 
    registros.filter(r => r.nomeAluno === alunoSelecionadoPai), 
  [registros, alunoSelecionadoPai]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Seletor de Aluno (Filho) */}
      <div className="bg-app-surface p-6 sm:p-8 rounded-[2rem] border border-app-border/60 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-app-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
          <User size={14} className="text-app-accent" />
          Selecione o perfil do seu filho(a)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
          {appUser.filhos?.map(a => (
            <button
              key={a}
              onClick={() => setAlunoSelecionadoPai(a)}
              className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all duration-300 ${
                alunoSelecionadoPai === a 
                  ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-md shadow-app-accent/10 scale-[1.02] ring-1 ring-app-accent/50' 
                  : 'bg-app-input border-transparent text-app-text-muted hover:bg-app-surface-hover hover:border-app-border/60 hover:shadow-sm'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${alunoSelecionadoPai === a ? 'bg-gradient-to-br from-app-accent to-app-accent/80 text-app-accent-text shadow-app-accent/30' : 'bg-app-surface border border-app-border/60'}`}>
                <User size={24} />
              </div>
              <div>
                <span className="font-bold text-lg block leading-tight text-app-text">{a}</span>
                {alunoSelecionadoPai === a && <span className="text-[10px] font-bold uppercase tracking-widest text-app-accent mt-1 block">Selecionado</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard de Progresso (Momento Uau) */}
      {alunoSelecionadoPai && (
        <ProgressDashboard registros={registros} nomeAluno={alunoSelecionadoPai} />
      )}

      {/* Resumo do Aluno */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 mt-12 mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-3 text-app-text tracking-tight">
          <div className="p-2 bg-app-input rounded-xl">
            <Clock size={24} className="text-app-accent" />
          </div>
          Histórico de {alunoSelecionadoPai}
        </h3>
        <div className="bg-app-surface px-5 py-3 rounded-2xl border border-app-border/60 w-full sm:w-auto text-center shadow-sm flex items-center gap-4">
          <div className="text-left">
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest">Total de Registros</p>
            <p className="text-2xl font-black text-app-text leading-none mt-1">{registrosFiltradosPai.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-app-accent/10 flex items-center justify-center text-app-accent">
            <Clock size={20} />
          </div>
        </div>
      </div>
      
      <RegistrosList 
        dados={registrosFiltradosPai} 
        appUser={appUser}
        onEdit={setRegistroToEdit}
      />
    </div>
  );
});
