import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, FileText, TrendingUp, Activity, BellRing } from 'lucide-react';
import { simulateEngagementNotifications } from '../services/notificationService';

interface Registro {
  id: string;
  dataHora: Date;
  nomeAluno: string;
  habilidadeAlvo: string;
  nivelSucesso: string;
  observacoes: string;
  authorUid: string;
}

interface AdminDashboardProps {
  registros: Registro[];
  alunosCount: number;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const COLORS = ['var(--success)', 'var(--accent)', 'var(--danger)', '#4299E1'];

export const AdminDashboard = React.memo(function AdminDashboard({ registros, alunosCount, showToast }: AdminDashboardProps) {
  // 1. Métricas Gerais
  const totalRegistros = registros.length;
  
  const registrosEstaSemana = useMemo(() => {
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    return registros.filter(r => r.dataHora >= umaSemanaAtras).length;
  }, [registros]);

  // 2. Dados para Gráfico de Pizza (Nível de Sucesso)
  const dadosNivelSucesso = useMemo(() => {
    const contagem: Record<string, number> = {
      'Independente': 0,
      'Com ajuda parcial': 0,
      'Com ajuda total': 0,
      'Não realizou': 0
    };
    
    registros.forEach(r => {
      if (contagem[r.nivelSucesso] !== undefined) {
        contagem[r.nivelSucesso]++;
      }
    });

    return Object.keys(contagem).map(key => ({
      name: key,
      value: contagem[key]
    })).filter(d => d.value > 0);
  }, [registros]);

  // 3. Dados para Gráfico de Barras (Habilidades mais trabalhadas)
  const dadosHabilidades = useMemo(() => {
    const contagem: Record<string, number> = {};
    
    registros.forEach(r => {
      contagem[r.habilidadeAlvo] = (contagem[r.habilidadeAlvo] || 0) + 1;
    });

    return Object.keys(contagem)
      .map(key => ({
        name: key,
        quantidade: contagem[key]
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5); // Top 5
  }, [registros]);

  const handleSimulateNotifications = async () => {
    try {
      await simulateEngagementNotifications();
      showToast('Notificações de engajamento enviadas com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar notificações", error);
      showToast('Erro ao enviar notificações.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSimulateNotifications}
          className="flex items-center gap-2 bg-app-accent hover:bg-app-accent-hover text-app-accent-text px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
        >
          <BellRing size={18} />
          Disparar Notificações de Engajamento
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-app-surface border border-app-border/60 p-6 rounded-3xl shadow-sm flex items-center gap-5 hover:shadow-md hover:border-app-border transition-all duration-300 group">
          <div className="bg-blue-500/10 text-blue-500 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
            <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest mb-1">Total de Alunos</p>
            <p className="text-3xl font-black text-app-text leading-none">{alunosCount}</p>
          </div>
        </div>
        
        <div className="bg-app-surface border border-app-border/60 p-6 rounded-3xl shadow-sm flex items-center gap-5 hover:shadow-md hover:border-app-border transition-all duration-300 group">
          <div className="bg-app-accent/10 text-app-accent p-4 rounded-2xl group-hover:scale-110 group-hover:bg-app-accent/20 transition-all duration-300">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest mb-1">Total de Registros</p>
            <p className="text-3xl font-black text-app-text leading-none">{totalRegistros}</p>
          </div>
        </div>

        <div className="bg-app-surface border border-app-border/60 p-6 rounded-3xl shadow-sm flex items-center gap-5 hover:shadow-md hover:border-app-border transition-all duration-300 group">
          <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest mb-1">Registros (7 dias)</p>
            <p className="text-3xl font-black text-app-text leading-none">{registrosEstaSemana}</p>
          </div>
        </div>

        <div className="bg-app-surface border border-app-border/60 p-6 rounded-3xl shadow-sm flex items-center gap-5 hover:shadow-md hover:border-app-border transition-all duration-300 group">
          <div className="bg-purple-500/10 text-purple-500 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest mb-1">Média Diária</p>
            <p className="text-3xl font-black text-app-text leading-none">
              {totalRegistros > 0 ? (registrosEstaSemana / 7).toFixed(1) : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Pizza - Níveis de Sucesso */}
        <div className="bg-app-surface border border-app-border/60 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-app-input/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <h3 className="text-lg font-bold text-app-text mb-8 tracking-tight relative z-10">Distribuição por Nível de Sucesso</h3>
          <div className="h-[300px] w-full mt-auto relative z-10">
            {dadosNivelSucesso.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosNivelSucesso}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {dadosNivelSucesso.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      padding: '12px',
                      color: 'var(--text)'
                    }}
                    itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-app-text-muted font-medium">Sem dados suficientes</div>
            )}
          </div>
        </div>

        {/* Gráfico de Barras - Habilidades */}
        <div className="bg-app-surface border border-app-border/60 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-app-input/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <h3 className="text-lg font-bold text-app-text mb-8 tracking-tight relative z-10">Top 5 Habilidades Trabalhadas</h3>
          <div className="h-[300px] w-full mt-auto relative z-10">
            {dadosHabilidades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosHabilidades} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} opacity={0.5} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={120} tick={{fontSize: 11, fontWeight: 500}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'var(--surface-hover)'}}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      padding: '12px',
                      color: 'var(--text)'
                    }}
                    itemStyle={{ color: 'var(--accent)', fontWeight: 600 }}
                  />
                  <Bar dataKey="quantidade" fill="var(--accent)" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-app-text-muted font-medium">Sem dados suficientes</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
});
