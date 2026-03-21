import React, { useState } from 'react';
import { User, Trash2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { hapticSuccess, hapticError, hapticImpact } from '../utils/haptics';

interface AdminAlunosProps {
  alunosList: { id: string; nome: string }[];
  appUser: { role: string };
  showToast: (message: string, type?: 'success' | 'error') => void;
  setAlunoToDelete: (aluno: { id: string; nome: string } | null) => void;
}

export const AdminAlunos = React.memo(function AdminAlunos({ alunosList, appUser, showToast, setAlunoToDelete }: AdminAlunosProps) {
  const [novoAluno, setNovoAluno] = useState('');

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAluno.trim() || appUser?.role !== 'admin') return;
    try {
      await addDoc(collection(db, 'alunos'), {
        nome: novoAluno.trim(),
        createdAt: serverTimestamp()
      });
      await hapticSuccess();
      setNovoAluno('');
      showToast('Aluno adicionado com sucesso!');
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
      await hapticError();
      showToast('Erro ao adicionar aluno.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-app-surface p-6 sm:p-8 rounded-3xl border border-app-border/60 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-app-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-app-text tracking-tight relative z-10">
          <div className="p-2.5 bg-app-accent/10 rounded-xl text-app-accent">
            <User size={24} />
          </div>
          Adicionar Novo Aluno
        </h3>
        <form onSubmit={handleAddAluno} className="flex flex-col sm:flex-row gap-4 relative z-10">
          <input 
            type="text" 
            value={novoAluno}
            onChange={(e) => setNovoAluno(e.target.value)}
            placeholder="Nome completo do aluno"
            className="flex-1 bg-app-input border border-app-border/60 rounded-2xl p-4 text-app-text focus:outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 transition-all duration-300 placeholder:text-app-text-muted/50 font-medium"
          />
          <button 
            type="submit"
            className="bg-app-accent text-app-accent-text font-bold px-8 py-4 rounded-2xl hover:bg-app-accent-hover transition-all duration-300 active:scale-[0.98] whitespace-nowrap shadow-md shadow-app-accent/20 hover:shadow-lg hover:-translate-y-0.5"
          >
            Cadastrar Aluno
          </button>
        </form>
      </div>

      <div className="bg-app-surface p-6 sm:p-8 rounded-3xl border border-app-border/60 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-app-text tracking-tight">Alunos Cadastrados</h3>
          <span className="bg-app-input text-app-text-muted px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
            Total: {alunosList.length}
          </span>
        </div>
        
        {alunosList.length === 0 ? (
          <div className="text-center py-12 bg-app-input/50 rounded-2xl border border-app-border/40 border-dashed">
            <User size={32} className="mx-auto text-app-text-muted/50 mb-3" />
            <p className="text-app-text-muted font-medium">Nenhum aluno cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alunosList.map(a => (
              <div key={a.id} className="bg-app-input border border-app-border/60 p-4 rounded-2xl flex justify-between items-center group hover:border-app-accent/40 hover:bg-app-surface transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-app-surface border border-app-border/60 flex items-center justify-center shrink-0 group-hover:bg-app-accent/10 group-hover:border-app-accent/20 group-hover:text-app-accent transition-colors duration-300">
                    <User size={20} className="text-app-text-muted group-hover:text-app-accent transition-colors" />
                  </div>
                  <span className="font-bold text-app-text truncate text-lg">{a.nome}</span>
                </div>
                <button 
                  onClick={() => {
                    hapticImpact();
                    setAlunoToDelete(a);
                  }}
                  className="text-app-text-muted hover:text-red-500 hover:bg-red-500/10 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 focus:opacity-100"
                  title="Remover aluno"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
