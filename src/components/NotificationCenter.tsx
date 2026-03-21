import React, { useMemo } from 'react';
import { Bell, X, Check, Info, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { hapticImpact } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'engagement';
  read: boolean;
  createdAt: Date;
}

interface NotificationCenterProps {
  notifications: AppNotification[];
  onClose: () => void;
}

export const NotificationCenter = React.memo(function NotificationCenter({ notifications, onClose }: NotificationCenterProps) {
  
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.read === b.read) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.read ? 1 : -1;
    });
  }, [notifications]);

  const handleMarkAsRead = async (id: string, read: boolean) => {
    if (read) return;
    try {
      hapticImpact();
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      hapticImpact();
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'engagement': return <Star size={20} className="text-app-accent" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
        
        {/* Panel */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-app-surface shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-app-border/60">
            <div className="flex items-center gap-3">
              <div className="bg-app-accent/10 p-2 rounded-xl text-app-accent">
                <Bell size={24} />
              </div>
              <h2 className="text-xl font-bold text-app-text tracking-tight">Notificações</h2>
            </div>
            <button 
              onClick={onClose}
              aria-label="Fechar notificações"
              className="p-2 text-app-text-muted hover:text-app-text hover:bg-app-input rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Actions */}
          {notifications.some(n => !n.read) && (
            <div className="px-6 py-3 bg-app-input/50 border-b border-app-border/60 flex justify-end">
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-app-accent hover:text-app-accent-hover uppercase tracking-widest flex items-center gap-1"
              >
                <Check size={14} />
                Marcar todas como lidas
              </button>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-app-text-muted opacity-60">
                <Bell size={48} className="mb-4" />
                <p className="font-medium">Nenhuma notificação no momento.</p>
              </div>
            ) : (
              <AnimatePresence>
                {sortedNotifications.map(notif => (
                  <motion.div 
                    layout
                    key={notif.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMarkAsRead(notif.id, notif.read)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${
                      notif.read 
                        ? 'bg-app-surface border-app-border/40 opacity-70' 
                        : 'bg-app-input border-app-accent/30 shadow-sm'
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-sm ${notif.read ? 'text-app-text-muted' : 'text-app-text'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-app-accent shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-app-text-muted leading-relaxed mb-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-app-text-muted/60">
                        {notif.createdAt.toLocaleDateString('pt-BR')} às {notif.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
    </motion.div>
  );
});
