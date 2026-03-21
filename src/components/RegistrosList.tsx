import React from 'react';
import { ClipboardList, Clock, User, Edit2 } from 'lucide-react';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';
import { motion, AnimatePresence } from 'motion/react';

interface Registro {
  id: string;
  dataHora: Date;
  nomeAluno: string;
  habilidadeAlvo: string;
  nivelSucesso: string;
  observacoes: string;
  photoBase64?: string;
  authorUid: string;
  authorName?: string;
}

interface AppUser {
  uid: string;
  role: 'professor' | 'pai' | 'admin';
  email: string;
  name: string;
  filhos?: string[];
}

export const RegistrosList = React.memo(({ dados, appUser, onEdit }: { dados: Registro[], appUser: AppUser | null, onEdit: (registro: Registro) => void }) => {
  if (dados.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-app-surface border border-app-border/60 rounded-3xl p-12 text-center shadow-sm"
      >
        <div className="w-16 h-16 bg-app-input rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList size={32} className="text-app-text-muted" />
        </div>
        <p className="text-app-text-muted text-lg font-medium">Nenhum registro encontrado.</p>
      </motion.div>
    );
  }

  return (
    <HorizontalScrollContainer className="flex gap-4 md:gap-6 pb-6 snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
      <AnimatePresence>
        {dados.map((registro) => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            key={registro.id} 
            className="w-[85vw] sm:w-[320px] md:w-[380px] shrink-0 snap-center bg-app-surface p-6 sm:p-7 rounded-3xl border border-app-border/60 flex flex-col h-full shadow-sm hover:shadow-md hover:border-app-border transition-all duration-300 select-none group"
          >
            <div className="flex justify-between items-start mb-5">
              <span className="inline-block bg-app-accent/10 text-app-accent px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
                {registro.habilidadeAlvo}
              </span>
              <div className="flex items-center text-app-text-muted text-xs gap-1.5 bg-app-input px-2.5 py-1.5 rounded-lg font-mono">
                <Clock size={12} />
                {registro.dataHora.toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <div className="mb-5">
              <p className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold mb-1.5">Aluno</p>
              <p className="font-semibold text-app-text text-lg mb-4">{registro.nomeAluno}</p>
              
              <p className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold mb-1.5">Nível de Sucesso</p>
              <p className="font-semibold text-app-text text-xl">{registro.nivelSucesso}</p>
            </div>

            {registro.photoBase64 && (
              <div className="mb-5 rounded-2xl overflow-hidden border border-app-border/60">
                <img src={registro.photoBase64} alt="Anexo do registro" className="w-full h-40 object-cover" />
              </div>
            )}

            {registro.observacoes && (
              <div className="pt-5 border-t border-app-border/60 mt-auto">
                <p className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold mb-2">Observações</p>
                <p className="text-sm leading-relaxed text-app-text-muted italic">"{registro.observacoes}"</p>
              </div>
            )}

            <div className={`mt-5 pt-5 border-t border-app-border/60 flex items-center ${appUser?.role === 'admin' || appUser?.uid === registro.authorUid ? 'justify-between' : 'justify-start'}`}>
              <div className="flex items-center gap-2 text-xs text-app-text-muted font-medium">
                <div className="w-6 h-6 rounded-full bg-app-input flex items-center justify-center">
                  <User size={12} />
                </div>
                <span>Prof. {registro.authorName || 'Desconhecido'}</span>
              </div>
              
              {(appUser?.role === 'admin' || appUser?.uid === registro.authorUid) && (
                <button
                  onClick={() => onEdit(registro)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-app-text-muted hover:text-app-accent transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Editar Registro"
                >
                  <Edit2 size={14} />
                  Editar
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </HorizontalScrollContainer>
  );
});

RegistrosList.displayName = 'RegistrosList';
