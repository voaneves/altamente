import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AppUser } from './useAuth';
import { AppNotification } from '../components/NotificationCenter';

export interface Registro {
  id: string;
  dataHora: Date;
  nomeAluno: string;
  habilidadeAlvo: string;
  nivelSucesso: string;
  observacoes: string;
  authorUid: string;
  authorName?: string;
}

export function useData(appUser: AppUser | null) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [alunosList, setAlunosList] = useState<{id: string, nome: string}[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!appUser) return;

    // Buscar Registros
    let qRegistros;
    if (appUser.role === 'admin') {
      qRegistros = query(collection(db, 'registros'));
    } else if (appUser.role === 'professor') {
      qRegistros = query(collection(db, 'registros'), where('authorUid', '==', appUser.uid));
    } else if (appUser.role === 'pai' && appUser.filhos && appUser.filhos.length > 0) {
      qRegistros = query(collection(db, 'registros'), where('nomeAluno', 'in', appUser.filhos));
    } else {
      qRegistros = query(collection(db, 'registros'), where('authorUid', '==', 'none'));
    }

    const unsubRegistros = onSnapshot(qRegistros, (snapshot) => {
      const regs: Registro[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        let habilidade = data.habilidadeAlvo;
        if (habilidade === 'Autonomia') habilidade = 'Comunicação Expressiva';
        
        let nivel = data.nivelSucesso;
        if (nivel === 'Com Ajuda Visual') nivel = 'Com ajuda parcial';
        if (nivel === 'Com Ajuda Física') nivel = 'Com ajuda total';

        regs.push({
          id: doc.id,
          dataHora: data.dataHora?.toDate() || new Date(),
          nomeAluno: data.nomeAluno,
          habilidadeAlvo: habilidade,
          nivelSucesso: nivel,
          observacoes: data.observacoes || '',
          authorUid: data.authorUid,
          authorName: data.authorName
        });
      });
      regs.sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
      setRegistros(regs);
    }, (error) => {
      console.error("Firestore Error (registros):", error);
    });

    // Buscar Alunos
    const qAlunos = query(collection(db, 'alunos'), orderBy('nome'));
    const unsubAlunos = onSnapshot(qAlunos, (snapshot) => {
      const lista: {id: string, nome: string}[] = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, nome: doc.data().nome });
      });
      setAlunosList(lista);
    }, (error) => {
      console.error("Firestore Error (alunos):", error);
    });

    // Buscar Notificações
    const qNotifs = query(collection(db, 'notifications'), where('userId', '==', appUser.uid), orderBy('createdAt', 'desc'));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          read: data.read,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setNotifications(notifs);
    }, (error) => {
      console.error("Firestore Error (notifications):", error);
    });

    return () => {
      unsubRegistros();
      unsubAlunos();
      unsubNotifs();
    };
  }, [appUser]);

  return { registros, alunosList, notifications };
}
