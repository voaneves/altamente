import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, errorInfo: any}> {
  state = { hasError: false, errorInfo: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app-bg text-app-text flex items-center justify-center p-4">
          <div className="bg-app-surface p-8 rounded-2xl border border-red-900/50 max-w-lg w-full text-center">
            <AlertTriangle size={48} className="mx-auto text-app-danger mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro de Permissão ou Conexão</h2>
            <p className="text-app-text-muted mb-4 text-sm">Ocorreu um erro ao acessar os dados. Verifique se você tem permissão para esta ação.</p>
            <button onClick={() => window.location.reload()} className="bg-app-accent text-app-accent-text px-6 py-2 rounded-xl font-bold">
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}
