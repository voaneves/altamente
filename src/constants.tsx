import React from 'react';
import { Users, Target, Activity, MessageSquare, Heart, CheckCircle2, ThumbsUp, Hand, LifeBuoy, XCircle } from 'lucide-react';

export const HABILIDADES = ['Interação Social', 'Foco e Atenção', 'Coordenação Motora', 'Comunicação Expressiva', 'Regulação Emocional'];
export const NIVEIS_SUCESSO = ['Independente', 'Com ajuda parcial', 'Com ajuda total', 'Não realizou'];

export const getHabilidadeIcon = (habilidade: string) => {
  switch (habilidade) {
    case 'Interação Social': return <Users size={32} />;
    case 'Foco e Atenção': return <Target size={32} />;
    case 'Coordenação Motora': return <Activity size={32} />;
    case 'Comunicação Expressiva': return <MessageSquare size={32} />;
    case 'Regulação Emocional': return <Heart size={32} />;
    default: return <CheckCircle2 size={32} />;
  }
};

export const getNivelIcon = (nivel: string) => {
  switch (nivel) {
    case 'Independente': return <ThumbsUp size={36} />;
    case 'Com ajuda parcial': return <Hand size={36} />;
    case 'Com ajuda total': return <LifeBuoy size={36} />;
    case 'Não realizou': return <XCircle size={36} />;
    default: return <CheckCircle2 size={36} />;
  }
};
