import React, { useState } from 'react';
import { User, Zap, Camera, Image as ImageIcon, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { HABILIDADES, NIVEIS_SUCESSO, getHabilidadeIcon, getNivelIcon } from '../constants';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';
import { hapticSuccess, hapticError, hapticImpact } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { notifyParentsOfRecord } from '../services/notificationService';

interface RegistroFormProps {
  alunosList: { id: string; nome: string }[];
  appUser: { uid: string; name: string };
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const RegistroForm = React.memo(function RegistroForm({ alunosList, appUser, showToast }: RegistroFormProps) {
  const [aluno, setAluno] = useState('');
  const [habilidade, setHabilidade] = useState('');
  const [nivel, setNivel] = useState('');
  const [obs, setObs] = useState('');
  const [manterAluno, setManterAluno] = useState(true);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const takePhoto = async (source: CameraSource) => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source,
        width: 800
      });
      if (image.base64String) {
        setPhotoBase64(`data:image/${image.format};base64,${image.base64String}`);
        hapticImpact();
      }
    } catch (error) {
      console.error('Error taking photo', error);
    }
  };

  const handleExpressLog = async (habilidadeExp: string, nivelExp: string, obsExp: string) => {
    if (!aluno || !appUser) {
      showToast('Por favor, selecione um aluno primeiro.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'registros'), {
        dataHora: serverTimestamp(),
        nomeAluno: aluno,
        habilidadeAlvo: habilidadeExp,
        nivelSucesso: nivelExp,
        observacoes: obsExp,
        photoBase64: photoBase64,
        authorUid: appUser.uid,
        authorName: appUser.name
      });
      
      await hapticSuccess();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD166', '#4CAF50', '#4299E1']
      });

      if (!manterAluno) {
        setAluno('');
      }
      setHabilidade('');
      setNivel('');
      setObs('');
      setPhotoBase64(null);
      
      showToast('Registro salvo com sucesso!');
      
      // Notify parents
      notifyParentsOfRecord(aluno, appUser.name, habilidadeExp, !!photoBase64);
    } catch (error) {
      console.error("Error saving record:", error);
      await hapticError();
      showToast('Erro ao salvar registro. Verifique suas permissões.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aluno || !habilidade || !nivel || !appUser) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'registros'), {
        dataHora: serverTimestamp(),
        nomeAluno: aluno,
        habilidadeAlvo: habilidade,
        nivelSucesso: nivel,
        observacoes: obs,
        photoBase64: photoBase64,
        authorUid: appUser.uid,
        authorName: appUser.name
      });
      
      await hapticSuccess();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD166', '#4CAF50', '#4299E1']
      });

      if (!manterAluno) {
        setAluno('');
      }
      setHabilidade('');
      setNivel('');
      setObs('');
      setPhotoBase64(null);
      
      showToast('Registro salvo com sucesso!');
      
      // Notify parents
      notifyParentsOfRecord(aluno, appUser.name, habilidade, !!photoBase64);
    } catch (error) {
      console.error("Error saving record:", error);
      await hapticError();
      showToast('Erro ao salvar registro. Verifique suas permissões.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 md:bg-app-surface md:p-10 md:rounded-2xl md:border md:border-app-border/40 md:shadow-soft-hover">
      <div className="flex flex-col gap-10">
        {/* Aluno */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <label className="block text-xl font-bold text-app-text tracking-tight">1. Quem é o aluno? *</label>
            <label className="flex items-center gap-2 text-sm font-medium text-app-text-muted cursor-pointer hover:text-app-text transition-colors">
              <input 
                type="checkbox" 
                checked={manterAluno} 
                onChange={(e) => setManterAluno(e.target.checked)}
                className="w-4 h-4 rounded border-app-border text-app-accent focus:ring-app-accent focus:ring-offset-0 bg-app-input"
              />
              Manter selecionado
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {alunosList.map(a => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  hapticImpact();
                  setAluno(a.nome);
                }}
                className={`p-4 sm:p-5 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 min-h-[120px] ${
                  aluno === a.nome 
                    ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-soft scale-[1.02]' 
                    : 'bg-app-surface md:bg-app-input border-app-border/40 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border hover:shadow-soft'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors ${aluno === a.nome ? 'bg-app-accent text-app-accent-text shadow-md shadow-app-accent/20' : 'bg-app-border/50 text-app-text-muted'}`}>
                  <User size={26} />
                </div>
                <span className="text-sm font-semibold text-center leading-tight">{a.nome}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Registro Expresso */}
        {aluno && (
          <div className="bg-gradient-to-br from-app-accent/10 to-transparent border border-app-accent/20 rounded-3xl p-5 md:p-7 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-app-accent uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={16} className="fill-app-accent" />
              Registro Expresso (1 Clique)
            </h4>
            <HorizontalScrollContainer className="flex gap-3 pb-2">
              <button
                type="button"
                onClick={() => {
                  hapticImpact();
                  handleExpressLog('Comunicação Expressiva', 'Independente', 'Comunicou necessidade de forma clara');
                }}
                className="shrink-0 bg-app-surface border border-app-border hover:border-app-accent hover:shadow-soft hover:shadow-app-accent/10 text-app-text px-5 py-4 rounded-xl flex flex-col gap-1.5 transition-all duration-300 text-left"
              >
                <span className="font-semibold text-sm">Comunicação Clara</span>
                <span className="text-xs text-app-text-muted">Expressiva • Independente</span>
              </button>
              <button
                type="button"
                onClick={() => handleExpressLog('Interação Social', 'Independente', 'Boa interação com colegas')}
                className="shrink-0 bg-app-surface border border-app-border hover:border-app-accent hover:shadow-soft hover:shadow-app-accent/10 text-app-text px-5 py-4 rounded-xl flex flex-col gap-1.5 transition-all duration-300 text-left"
              >
                <span className="font-semibold text-sm">Interação Positiva</span>
                <span className="text-xs text-app-text-muted">Social • Independente</span>
              </button>
              <button
                type="button"
                onClick={() => handleExpressLog('Foco e Atenção', 'Com ajuda parcial', 'Precisou de suporte visual para focar')}
                className="shrink-0 bg-app-surface border border-app-border hover:border-app-accent hover:shadow-soft hover:shadow-app-accent/10 text-app-text px-5 py-4 rounded-xl flex flex-col gap-1.5 transition-all duration-300 text-left"
              >
                <span className="font-semibold text-sm">Foco com Apoio</span>
                <span className="text-xs text-app-text-muted">Atenção • Ajuda parcial</span>
              </button>
              <button
                type="button"
                onClick={() => handleExpressLog('Regulação Emocional', 'Com ajuda total', 'Crise regulada com contenção/ajuda')}
                className="shrink-0 bg-app-surface border border-app-border hover:border-app-accent hover:shadow-soft hover:shadow-app-accent/10 text-app-text px-5 py-4 rounded-xl flex flex-col gap-1.5 transition-all duration-300 text-left"
              >
                <span className="font-semibold text-sm">Regulação (Crise)</span>
                <span className="text-xs text-app-text-muted">Emocional • Ajuda total</span>
              </button>
            </HorizontalScrollContainer>
          </div>
        )}

        {/* Habilidade Alvo */}
        <div className="space-y-5">
          <label className="block text-xl font-bold text-app-text tracking-tight">2. Qual habilidade foi trabalhada? *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {HABILIDADES.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  hapticImpact();
                  setHabilidade(h);
                }}
                className={`p-4 sm:p-5 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 min-h-[120px] ${
                  habilidade === h 
                    ? 'bg-app-accent/10 border-app-accent text-app-accent shadow-soft scale-[1.02]' 
                    : 'bg-app-surface md:bg-app-input border-app-border/40 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border hover:shadow-soft'
                }`}
              >
                <div className={`transition-colors ${habilidade === h ? 'text-app-accent' : 'text-app-text-muted'}`}>
                  {getHabilidadeIcon(h)}
                </div>
                <span className="text-sm sm:text-base font-semibold text-center leading-tight">{h}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nível de Sucesso */}
        <div className="space-y-5">
          <label className="block text-xl font-bold text-app-text tracking-tight">3. Qual foi o nível de sucesso? *</label>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {NIVEIS_SUCESSO.map(n => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  hapticImpact();
                  setNivel(n);
                }}
                className={`p-5 sm:p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 min-h-[130px] ${
                  nivel === n 
                    ? 'bg-app-accent text-app-accent-text border-app-accent shadow-soft shadow-app-accent/20 scale-[1.02]' 
                    : 'bg-app-surface md:bg-app-input border-app-border/40 text-app-text-muted hover:bg-app-surface-hover hover:border-app-border hover:shadow-soft'
                }`}
              >
                <div className={`transition-colors ${nivel === n ? 'text-app-accent-text' : 'text-app-text-muted'}`}>
                  {getNivelIcon(n)}
                </div>
                <span className="text-base sm:text-lg font-semibold text-center leading-tight">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-5">
          <label className="block text-xl font-bold text-app-text tracking-tight">4. Observações e Anexos (opcional)</label>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className="w-full p-5 rounded-2xl border border-app-border/60 bg-app-input text-app-text focus:ring-2 focus:ring-app-accent/50 focus:border-app-accent transition-all duration-200 min-h-[120px] resize-y placeholder:text-app-text-muted/50 text-base"
            placeholder="Detalhes sobre a atividade, contexto, ou comportamento..."
          />
          
          <div className="flex flex-col gap-3">
            {photoBase64 ? (
              <div className="relative inline-block w-full max-w-sm">
                <img src={photoBase64} alt="Anexo" className="w-full rounded-2xl border border-app-border/60 object-cover max-h-48" />
                <button
                  type="button"
                  onClick={() => setPhotoBase64(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => takePhoto(CameraSource.Camera)}
                  className="flex-1 bg-app-surface border border-app-border/60 hover:border-app-accent text-app-text p-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Camera size={20} className="text-app-accent" />
                  <span className="font-semibold text-sm">Tirar Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => takePhoto(CameraSource.Photos)}
                  className="flex-1 bg-app-surface border border-app-border/60 hover:border-app-accent text-app-text p-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <ImageIcon size={20} className="text-app-accent" />
                  <span className="font-semibold text-sm">Galeria</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!aluno || !habilidade || !nivel}
          className="w-full bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-bold py-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-hover active:scale-[0.98] text-lg mt-4 flex items-center justify-center gap-2"
        >
          Salvar Registro
        </button>
      </div>
    </form>
  );
});
