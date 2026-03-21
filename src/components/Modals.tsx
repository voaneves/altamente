import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, XCircle } from 'lucide-react';
import { HABILIDADES, NIVEIS_SUCESSO } from '../constants';

export function DeleteAlunoModal({
  alunoToDelete,
  setAlunoToDelete,
  handleDeleteAluno
}: {
  alunoToDelete: { id: string, nome: string } | null;
  setAlunoToDelete: (val: any) => void;
  handleDeleteAluno: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {alunoToDelete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-app-surface rounded-2xl border border-app-border p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-app-text mb-2">Remover Aluno</h3>
            <p className="text-app-text-muted mb-6">
              Tem certeza que deseja remover o aluno <strong className="text-app-text">{alunoToDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAlunoToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-app-border-hover text-app-text-muted font-medium hover:bg-app-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteAluno(alunoToDelete.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-app-danger-bg border border-app-danger text-app-danger font-medium hover:bg-app-danger hover:text-app-text transition-colors"
              >
                Remover
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DeleteRegistroModal({
  registroToDelete,
  setRegistroToDelete,
  handleDeleteRegistro
}: {
  registroToDelete: any;
  setRegistroToDelete: (val: any) => void;
  handleDeleteRegistro: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {registroToDelete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-app-surface rounded-2xl border border-app-border p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-app-text mb-2">Remover Registro</h3>
            <p className="text-app-text-muted mb-6">
              Tem certeza que deseja remover este registro de <strong className="text-app-text">{registroToDelete.nomeAluno}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRegistroToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-app-border-hover text-app-text-muted font-medium hover:bg-app-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteRegistro(registroToDelete.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-app-danger-bg border border-app-danger text-app-danger font-medium hover:bg-app-danger hover:text-app-text transition-colors"
              >
                Remover
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function EditRegistroModal({
  registroToEdit,
  setRegistroToEdit,
  handleEditRegistro,
  setRegistroToDelete
}: {
  registroToEdit: any;
  setRegistroToEdit: (val: any) => void;
  handleEditRegistro: (e: React.FormEvent) => void;
  setRegistroToDelete: (val: any) => void;
}) {
  return (
    <AnimatePresence>
      {registroToEdit && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-app-surface rounded-2xl border border-app-border p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-app-text">Editar Registro</h3>
              <button 
                onClick={() => setRegistroToEdit(null)}
                className="text-app-text-muted hover:text-app-text transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditRegistro} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-app-text-muted mb-2">Habilidade Alvo</label>
                <select
                  value={registroToEdit.habilidadeAlvo}
                  onChange={(e) => setRegistroToEdit({...registroToEdit, habilidadeAlvo: e.target.value})}
                  className="w-full bg-app-input border border-app-border-hover rounded-xl p-3 text-app-text focus:outline-none focus:border-app-accent"
                  required
                >
                  <option value="" disabled>Selecione uma habilidade</option>
                  {HABILIDADES.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-app-text-muted mb-2">Nível de Sucesso</label>
                <select
                  value={registroToEdit.nivelSucesso}
                  onChange={(e) => setRegistroToEdit({...registroToEdit, nivelSucesso: e.target.value})}
                  className="w-full bg-app-input border border-app-border-hover rounded-xl p-3 text-app-text focus:outline-none focus:border-app-accent"
                  required
                >
                  <option value="" disabled>Selecione um nível</option>
                  {NIVEIS_SUCESSO.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-app-text-muted mb-2">Observações</label>
                <textarea
                  value={registroToEdit.observacoes}
                  onChange={(e) => setRegistroToEdit({...registroToEdit, observacoes: e.target.value})}
                  className="w-full bg-app-input border border-app-border-hover rounded-xl p-3 text-app-text focus:outline-none focus:border-app-accent min-h-[100px]"
                  placeholder="Adicione observações adicionais..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-app-border">
                <button
                  type="button"
                  onClick={() => {
                    setRegistroToDelete(registroToEdit);
                    setRegistroToEdit(null);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-app-danger-bg border border-app-danger text-app-danger font-medium hover:bg-app-danger hover:text-app-text transition-colors"
                >
                  <Trash2 size={18} />
                  Excluir Registro
                </button>
                <div className="flex-1 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistroToEdit(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-app-border-hover text-app-text-muted font-medium hover:bg-app-border transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-app-accent text-app-accent-text font-bold hover:bg-app-accent-hover transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
