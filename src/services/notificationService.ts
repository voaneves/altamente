import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const sendNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'engagement' = 'info') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error sending notification", error);
  }
};

export const notifyParentsOfRecord = async (alunoNome: string, professorNome: string, habilidade: string, hasPhoto: boolean) => {
  try {
    const qPais = query(collection(db, 'users'), where('role', '==', 'pai'), where('filhos', 'array-contains', alunoNome));
    const paisSnapshot = await getDocs(qPais);
    
    paisSnapshot.forEach(paiDoc => {
      const photoText = hasPhoto ? ' Tem foto nova! 📸' : '';
      sendNotification(
        paiDoc.id, 
        'Novo Registro de Habilidade 🌟', 
        `O professor ${professorNome} registrou um avanço em "${habilidade}" para ${alunoNome}.${photoText} Venha conferir!`, 
        'success'
      );
    });
  } catch (error) {
    console.error("Error notifying parents", error);
  }
};

export const simulateEngagementNotifications = async () => {
  try {
    // Notify all teachers
    const qProfs = query(collection(db, 'users'), where('role', '==', 'professor'));
    const profsSnapshot = await getDocs(qProfs);
    profsSnapshot.forEach(prof => {
      sendNotification(
        prof.id, 
        'Hora de brilhar! ✨', 
        'Você já registrou as conquistas dos seus alunos hoje? Cada pequeno passo importa!', 
        'engagement'
      );
    });

    // Notify all parents
    const qPais = query(collection(db, 'users'), where('role', '==', 'pai'));
    const paisSnapshot = await getDocs(qPais);
    paisSnapshot.forEach(pai => {
      sendNotification(
        pai.id, 
        'Dica de Ouro 💡', 
        'Comemorar as pequenas vitórias em casa ajuda no desenvolvimento. Que tal ver o histórico recente do seu filho?', 
        'engagement'
      );
    });

    // Notify admins
    const qAdmins = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminsSnapshot = await getDocs(qAdmins);
    adminsSnapshot.forEach(admin => {
      sendNotification(
        admin.id, 
        'Resumo da Semana 📊', 
        'Os professores estão engajados! Acesse o dashboard para ver as métricas completas de registros.', 
        'info'
      );
    });
  } catch (error) {
    console.error("Error simulating engagement", error);
  }
};
