import React, { useState, useMemo } from 'react';
import { ProgressDashboard } from './ProgressDashboard';
import { RegistrosList } from './RegistrosList';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

interface HistoricoProfessorProps {
  alunosList: { id: string; nome: string }[];
  registros: any[]; // Replace with proper type
  appUser: any; // Replace with proper type
  setRegistroToEdit: (registro: any) => void;
}

export const HistoricoProfessor = React.memo(function HistoricoProfessor({ alunosList, registros, appUser, setRegistroToEdit }: HistoricoProfessorProps) {
  const [filtroAlunoProf, setFiltroAlunoProf] = useState('');

  const registrosFiltradosProf = useMemo(() => 
    filtroAlunoProf ? registros.filter(r => r.nomeAluno === filtroAlunoProf) : registros, 
  [registros, filtroAlunoProf]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filtros */}
      <div className="bg-app-surface p-5 sm:p-6 rounded-3xl border border-app-border/60 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center shadow-sm">
        <span className="text-[10px] font-bold text-app-text-muted uppercase tracking-widest whitespace-nowrap">Filtrar por Aluno:</span>
        <HorizontalScrollContainer className="flex gap-2 w-full pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            onClick={() => setFiltroAlunoProf('')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 select-none ${
              filtroAlunoProf === '' ? 'bg-app-accent text-app-accent-text shadow-md shadow-app-accent/20 scale-105' : 'bg-app-input text-app-text-muted hover:text-app-text hover:bg-app-border/40'
            }`}
          >
            Todos
          </button>
          {alunosList.map(a => (
            <button
              key={a.id}
              onClick={() => setFiltroAlunoProf(a.nome)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 select-none ${
                filtroAlunoProf === a.nome ? 'bg-app-accent text-app-accent-text shadow-md shadow-app-accent/20 scale-105' : 'bg-app-input text-app-text-muted hover:text-app-text hover:bg-app-border/40'
              }`}
            >
              {a.nome}
            </button>
          ))}
        </HorizontalScrollContainer>
      </div>

      {/* Dashboard de Progresso (Momento Uau) - Só aparece se um aluno específico for selecionado */}
      {filtroAlunoProf && (
        <ProgressDashboard registros={registros} nomeAluno={filtroAlunoProf} />
      )}

      <RegistrosList 
        dados={registrosFiltradosProf} 
        appUser={appUser}
        onEdit={setRegistroToEdit}
      />
    </div>
  );
});
