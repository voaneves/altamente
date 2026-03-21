import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, TrendingUp, Star, Share2 } from 'lucide-react';

interface Registro {
  id: string;
  dataHora: Date;
  nomeAluno: string;
  habilidadeAlvo: string;
  nivelSucesso: string;
  observacoes: string;
  authorUid: string;
}

interface ProgressDashboardProps {
  registros: Registro[];
  nomeAluno: string;
}

const NIVEIS_PESO: Record<string, number> = {
  'Independente': 3,
  'Com ajuda parcial': 2,
  'Com ajuda total': 1,
  'Não realizou': 0
};

const PESO_NIVEIS: Record<number, string> = {
  3: 'Independente',
  2: 'Ajuda parcial',
  1: 'Ajuda total',
  0: 'Não realizou'
};

export const ProgressDashboard = React.memo(function ProgressDashboard({ registros, nomeAluno }: ProgressDashboardProps) {
  const dadosAluno = useMemo(() => registros.filter(r => r.nomeAluno === nomeAluno), [registros, nomeAluno]);
  
  const habilidadesDisponiveis = Array.from(new Set(dadosAluno.map(r => r.habilidadeAlvo)));
  const [habilidadeSelecionada, setHabilidadeSelecionada] = useState<string>(habilidadesDisponiveis[0] || 'Interação Social');

  // 1. Resumo Semanal (Últimos 7 dias)
  const conquistasIndependentes = useMemo(() => {
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    
    return dadosAluno.filter(r => 
      r.dataHora >= umaSemanaAtras && 
      r.nivelSucesso === 'Independente'
    ).length;
  }, [dadosAluno]);

  const handleShareWhatsApp = () => {
    const url = window.location.origin;
    const text = `*Relatório de Progresso: ${nomeAluno}* 🌟\n\n` +
      `Nesta semana, ${nomeAluno} teve ${conquistasIndependentes} conquista${conquistasIndependentes > 1 ? 's' : ''} independente${conquistasIndependentes > 1 ? 's' : ''}!\n\n` +
      `Acompanhe o ${nomeAluno} em tempo real. Baixe o Altamente App:\n` +
      `${url}`;
      
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // 2. Dados para o Gráfico de Linha (Evolução de uma habilidade)
  const dadosLinha = useMemo(() => {
    const filtrados = dadosAluno
      .filter(r => r.habilidadeAlvo === habilidadeSelecionada)
      .sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());
      
    return filtrados.map(r => ({
      data: r.dataHora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: NIVEIS_PESO[r.nivelSucesso] || 0,
      nivel: r.nivelSucesso,
      obs: r.observacoes
    }));
  }, [dadosAluno, habilidadeSelecionada]);

  // 3. Dados para o Gráfico Radar (Média por habilidade)
  const dadosRadar = useMemo(() => {
    const habilidades = ['Interação Social', 'Foco e Atenção', 'Coordenação Motora', 'Comunicação Expressiva', 'Regulação Emocional'];
    
    return habilidades.map(hab => {
      const regs = dadosAluno.filter(r => r.habilidadeAlvo === hab);
      if (regs.length === 0) return { habilidade: hab, media: 0, total: 0 };
      
      const soma = regs.reduce((acc, r) => acc + (NIVEIS_PESO[r.nivelSucesso] || 0), 0);
      return {
        habilidade: hab,
        media: Number((soma / regs.length).toFixed(1)),
        total: regs.length
      };
    });
  }, [dadosAluno]);

  if (dadosAluno.length === 0) return null;

  return (
    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Card de Resumo Semanal */}
      <div className="bg-gradient-to-br from-app-accent/10 via-app-surface to-app-surface border border-app-accent/20 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-app-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="bg-gradient-to-br from-app-accent to-app-accent/80 text-app-accent-text p-4 rounded-2xl shrink-0 shadow-lg shadow-app-accent/20">
            <Trophy size={32} className="drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-app-text tracking-tight leading-tight mb-1.5">
              {conquistasIndependentes > 0 
                ? <>{nomeAluno} teve <span className="text-app-accent">{conquistasIndependentes} conquista{conquistasIndependentes > 1 ? 's' : ''} independente{conquistasIndependentes > 1 ? 's' : ''}</span> esta semana! 🎉</>
                : `${nomeAluno} está no caminho certo! Continue registrando o progresso. 💪`}
            </h3>
            <p className="text-sm text-app-text-muted font-medium">Baseado nos registros dos últimos 7 dias.</p>
          </div>
        </div>
        
        <button
          onClick={handleShareWhatsApp}
          className="w-full sm:w-auto shrink-0 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 relative z-10"
        >
          <Share2 size={18} />
          <span>Compartilhar com a Família</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha */}
        <div className="bg-app-surface border border-app-border/60 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-app-input/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-app-input rounded-xl">
                <TrendingUp size={20} className="text-app-accent" />
              </div>
              <h3 className="text-lg font-bold text-app-text tracking-tight">
                Evolução ao Longo do Tempo
              </h3>
            </div>
            {habilidadesDisponiveis.length > 0 && (
              <select 
                value={habilidadeSelecionada}
                onChange={(e) => setHabilidadeSelecionada(e.target.value)}
                className="bg-app-input border border-app-border/60 rounded-xl px-4 py-2 text-sm font-medium text-app-text focus:outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 max-w-[200px] truncate transition-all cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                {habilidadesDisponiveis.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            )}
          </div>
          
          <div className="h-[280px] w-full mt-auto relative z-10">
            {dadosLinha.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosLinha} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="data" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    tickMargin={12} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 3]} 
                    ticks={[0, 1, 2, 3]} 
                    stroke="var(--text-muted)" 
                    fontSize={11}
                    tickFormatter={(val) => PESO_NIVEIS[Number(val)] || ''}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ color: 'var(--accent)', fontWeight: 600 }}
                    formatter={(value: number, name: string, props: any) => [props.payload.nivel, 'Nível']}
                    labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="var(--accent)" 
                    strokeWidth={4}
                    dot={{ fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-app-text-muted text-sm text-center px-4">
                Não há dados suficientes para esta habilidade.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico Radar */}
        <div className="bg-app-surface border border-app-border/60 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-app-input/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <div className="mb-8 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-app-input rounded-xl">
                <Star size={20} className="text-app-accent" />
              </div>
              <h3 className="text-lg font-bold text-app-text tracking-tight">
                Equilíbrio de Habilidades
              </h3>
            </div>
            <p className="text-sm text-app-text-muted font-medium ml-11">Média geral de desempenho por área</p>
          </div>
          
          <div className="h-[280px] w-full mt-auto relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dadosRadar}>
                <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="habilidade" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 3]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: 'var(--accent)', fontWeight: 600 }}
                  formatter={(value: number) => [value, 'Média (0-3)']}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Radar 
                  name={nomeAluno} 
                  dataKey="media" 
                  stroke="var(--accent)" 
                  strokeWidth={3}
                  fill="var(--accent)" 
                  fillOpacity={0.2} 
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});
