import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, ClipboardList, CheckCircle2, Clock, User, History, LogIn, LogOut, AlertTriangle, Shield, Trash2, Users, Target, Activity, MessageSquare, Heart, ThumbsUp, Hand, LifeBuoy, XCircle, Edit2, Sun, Moon, Zap, Settings, Bell } from 'lucide-react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, User as FirebaseUser, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, onSnapshot, query, orderBy, addDoc, serverTimestamp, Timestamp, getDocs, deleteDoc, where } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { PushNotifications } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { hapticImpact, hapticSuccess, hapticError } from './utils/haptics';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAlunos } from './components/AdminAlunos';
import { FamiliaDashboard } from './components/FamiliaDashboard';
import { HistoricoProfessor } from './components/HistoricoProfessor';
import { RegistroForm } from './components/RegistroForm';
import { HABILIDADES, NIVEIS_SUCESSO, getHabilidadeIcon, getNivelIcon } from './constants';
import confetti from 'canvas-confetti';

import { SettingsPanel } from './components/SettingsPanel';
import { NotificationCenter, AppNotification } from './components/NotificationCenter';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { BottomNav } from './components/BottomNav';
import { DeleteAlunoModal, DeleteRegistroModal, EditRegistroModal } from './components/Modals';
import { ErrorBoundary } from './components/ErrorBoundary';

// Tipos de dados
interface Registro {
  id: string;
  dataHora: Date;
  nomeAluno: string;
  habilidadeAlvo: string;
  nivelSucesso: string;
  observacoes: string;
  authorUid: string;
  authorName?: string;
}

interface AppUser {
  uid: string;
  role: 'professor' | 'pai' | 'admin';
  email: string;
  name: string;
  filhos?: string[];
  fcmToken?: string;
}

type Tab = 'registrar' | 'historico' | 'visao_pais' | 'admin' | 'dashboard_admin' | 'configuracoes';

import { useData } from './hooks/useData';
import { HorizontalScrollContainer } from './components/HorizontalScrollContainer';

import { RegistrosList } from './components/RegistrosList';

function MainApp() {
  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>('registrar');

  // Data State
  const { registros, alunosList, notifications } = useData(appUser);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);

  // Form State
  const [alunoToDelete, setAlunoToDelete] = useState<{id: string, nome: string} | null>(null);
  const [registroToDelete, setRegistroToDelete] = useState<Registro | null>(null);
  const [registroToEdit, setRegistroToEdit] = useState<Registro | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved ? saved === 'dark' : true;
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('app_fontSize') as 'sm' | 'md' | 'lg') || 'md';
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('app_highContrast') === 'true';
  });

  // Setup Role Form
  const [tempRole, setTempRole] = useState<'professor' | 'pai' | 'admin'>('professor');
  const [tempFilho, setTempFilho] = useState('');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = React.useCallback((message: string, type: 'success'|'error' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Need to replace with actual client ID later
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      // Hide Splash Screen
      SplashScreen.hide();

      // Request Push Notification permissions
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        setFcmToken(token.value);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }

    // High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('app_highContrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('app_highContrast', 'false');
    }

    // Font Size
    if (fontSize === 'sm') root.style.fontSize = '14px';
    else if (fontSize === 'md') root.style.fontSize = '16px';
    else if (fontSize === 'lg') root.style.fontSize = '18px';
    localStorage.setItem('app_fontSize', fontSize);

  }, [isDarkMode, highContrast, fontSize]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            let userData = userDoc.data() as AppUser;
            
            let needsUpdate = false;
            // Auto-upgrade do dono do sistema para admin caso esteja como professor/pai
            if (currentUser.email === 'victorneves478@gmail.com' && userData.role !== 'admin') {
              userData.role = 'admin';
              needsUpdate = true;
            }

            if (fcmToken && userData.fcmToken !== fcmToken) {
              userData.fcmToken = fcmToken;
              needsUpdate = true;
            }

            if (needsUpdate) {
              try {
                await setDoc(doc(db, 'users', currentUser.uid), userData);
              } catch (e) {
                console.error("Erro ao atualizar user data:", e);
              }
            }

            setAppUser(userData);
            
            if (userData.role === 'admin') {
              setActiveTab('admin');
            } else if (userData.role === 'professor') {
              setActiveTab('registrar');
            } else {
              setActiveTab('visao_pais');
            }
          } else {
            setAppUser(null);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (appUser && fcmToken && appUser.fcmToken !== fcmToken) {
      const updateToken = async () => {
        try {
          await setDoc(doc(db, 'users', appUser.uid), { fcmToken }, { merge: true });
          setAppUser({ ...appUser, fcmToken });
        } catch (e) {
          console.error("Erro ao salvar FCM token:", e);
        }
      };
      updateToken();
    }
  }, [fcmToken, appUser]);

  const handleDeleteAluno = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'alunos', id));
      await hapticSuccess();
      showToast('Aluno removido com sucesso!');
      setAlunoToDelete(null);
    } catch (error) {
      console.error("Erro ao remover aluno:", error);
      await hapticError();
      showToast('Erro ao remover aluno.', 'error');
      setAlunoToDelete(null);
    }
  };

  const handleDeleteRegistro = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'registros', id));
      await hapticSuccess();
      showToast('Registro removido com sucesso!');
      setRegistroToDelete(null);
      setRegistroToEdit(null);
    } catch (error) {
      console.error("Erro ao remover registro:", error);
      await hapticError();
      showToast('Erro ao remover registro.', 'error');
      setRegistroToDelete(null);
    }
  };

  const handleEditRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroToEdit) return;
    
    try {
      await setDoc(doc(db, 'registros', registroToEdit.id), {
        ...registroToEdit,
        // We only update the fields that were changed in the state
      }, { merge: true });
      await hapticSuccess();
      showToast('Registro atualizado com sucesso!');
      setRegistroToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar registro:", error);
      await hapticError();
      showToast('Erro ao atualizar registro.', 'error');
    }
  };

  const handleLogin = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        if (googleUser && googleUser.authentication && googleUser.authentication.idToken) {
          const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
          await signInWithCredential(auth, credential);
        }
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleDevBypass = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error("Bypass error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert("Para usar o bypass, você precisa ir no painel do Firebase > Authentication > Sign-in method e ativar o provedor 'Anônimo'.");
      } else {
        alert("Erro ao entrar no modo dev: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newUser: AppUser = {
      uid: user.uid,
      role: tempRole,
      email: user.email || 'visitante@dev.com',
      name: user.displayName || 'Usuário Dev',
    };

    if (tempRole === 'pai') {
      if (!tempFilho) {
        showToast('Por favor, digite o nome do seu filho.', 'error');
        return;
      }
      newUser.filhos = [tempFilho];
    }

    if (tempRole === 'admin' && (user.isAnonymous || user.email !== 'victorneves478@gmail.com')) {
      showToast('Apenas o dono do sistema (victorneves478@gmail.com) pode ser Coordenador.', 'error');
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), newUser);
      setAppUser(newUser);
      setActiveTab(newUser.role === 'professor' ? 'registrar' : 'visao_pais');
      showToast('Perfil criado com sucesso!');
    } catch (error: any) {
      console.error("Error creating profile:", error);
      showToast(`Erro ao criar perfil: ${error.message || 'Verifique as permissões.'}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-pulse">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-app-border rounded-3xl"></div>
            <div className="w-48 h-8 bg-app-border rounded-lg"></div>
            <div className="w-32 h-4 bg-app-border rounded-lg"></div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-24 bg-app-surface border border-app-border rounded-2xl"></div>
            <div className="w-full h-14 bg-app-surface border border-app-border rounded-2xl"></div>
            <div className="w-full h-14 bg-app-surface border border-app-border rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-app-accent/5 to-transparent pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-app-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="bg-app-surface p-8 sm:p-10 rounded-[2rem] border border-app-border/60 shadow-2xl max-w-md w-full text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-app-accent to-app-accent/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-app-accent/20 rotate-3">
            <Zap size={40} className="text-app-accent-text drop-shadow-sm" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-app-text tracking-tight mb-2">
            Altamente
          </h1>
          <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest mb-8">Rastreamento Inclusivo</p>
          
          <div className="bg-app-input/50 border border-app-border/60 rounded-2xl p-5 mb-8 text-left flex items-start gap-4 shadow-sm">
            <div className="bg-app-surface border border-app-border/60 text-app-accent p-3 rounded-xl shrink-0 shadow-sm">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="font-bold text-app-text text-sm mb-1.5">Adeus, diários de papel!</h3>
              <p className="text-xs text-app-text-muted leading-relaxed font-medium">
                Registre o progresso dos seus alunos de inclusão em segundos. <strong className="text-app-text">100% gratuito para professores individuais</strong>.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-app-text text-app-bg font-bold text-lg p-4 rounded-2xl hover:bg-app-text/90 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <LogIn size={20} />
            Entrar com Google
          </button>

          <button 
            onClick={handleDevBypass}
            className="w-full mt-4 bg-app-surface border border-app-border/60 text-app-text-muted font-bold text-sm p-4 rounded-2xl hover:bg-app-input hover:text-app-text transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <User size={16} />
            Bypass Dev (Visitante)
          </button>
        </div>
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-app-accent/5 to-transparent pointer-events-none"></div>
        
        <div className="bg-app-surface p-8 sm:p-10 rounded-[2rem] border border-app-border/60 shadow-2xl max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-app-text tracking-tight mb-2">Complete seu Perfil</h2>
            <p className="text-sm text-app-text-muted font-medium">Como você vai usar o Altamente?</p>
          </div>
          
          <form onSubmit={handleCreateProfile} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-app-text-muted uppercase tracking-widest">Eu sou um(a):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTempRole('professor')}
                  className={`py-4 px-2 flex items-center justify-center rounded-2xl border text-center font-bold transition-all duration-300 text-sm ${
                    tempRole === 'professor' ? 'bg-app-accent text-app-accent-text border-app-accent shadow-md shadow-app-accent/20 scale-105' : 'bg-app-input border-transparent text-app-text-muted hover:bg-app-border/40 hover:text-app-text'
                  }`}
                >
                  Professor
                </button>
                <button
                  type="button"
                  onClick={() => setTempRole('pai')}
                  className={`py-4 px-2 flex items-center justify-center rounded-2xl border text-center font-bold transition-all duration-300 text-sm ${
                    tempRole === 'pai' ? 'bg-app-accent text-app-accent-text border-app-accent shadow-md shadow-app-accent/20 scale-105' : 'bg-app-input border-transparent text-app-text-muted hover:bg-app-border/40 hover:text-app-text'
                  }`}
                >
                  Pai/Mãe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (user.isAnonymous || user.email !== 'victorneves478@gmail.com') {
                      showToast('Apenas o dono do sistema (victorneves478@gmail.com) pode criar a primeira conta de Coordenador.', 'error');
                      return;
                    }
                    setTempRole('admin');
                  }}
                  className={`py-4 px-2 flex items-center justify-center rounded-2xl border text-center font-bold transition-all duration-300 text-sm ${
                    tempRole === 'admin' ? 'bg-app-accent text-app-accent-text border-app-accent shadow-md shadow-app-accent/20 scale-105' : 'bg-app-input border-transparent text-app-text-muted hover:bg-app-border/40 hover:text-app-text'
                  } ${(user.isAnonymous || user.email !== 'victorneves478@gmail.com') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Coordenador
                </button>
              </div>
            </div>

            {tempRole === 'pai' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-bold text-app-text-muted uppercase tracking-widest">Nome do seu filho(a):</label>
                <div className="relative">
                  <select 
                    value={tempFilho}
                    onChange={(e) => setTempFilho(e.target.value)}
                    className="w-full bg-app-input border border-app-border/60 rounded-2xl p-4 text-app-text font-medium focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 transition-all duration-300 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `3rem` }}
                  >
                    <option value="" disabled>Selecione o aluno...</option>
                    {alunosList.map(a => (
                      <option key={a.id} value={a.nome}>{a.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-app-accent text-app-accent-text font-bold text-lg p-4 rounded-2xl hover:bg-app-accent-hover transition-all duration-300 active:scale-[0.98] shadow-md shadow-app-accent/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              Concluir Cadastro
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans flex selection:bg-app-accent/30">
      <DesktopSidebar appUser={appUser} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <MobileHeader 
          appUser={appUser} 
          notifications={notifications} 
          setShowNotifications={setShowNotifications} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-[calc(9rem+var(--sab))] md:!pb-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-5xl mx-auto"
            >
              
              {/* Desktop Page Title */}
              <div className="hidden md:flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-4xl font-black text-app-text tracking-tight">
                    {activeTab === 'registrar' && 'Registro Rápido'}
                    {activeTab === 'historico' && 'Histórico de Registros'}
                    {activeTab === 'visao_pais' && 'Acompanhamento Familiar'}
                    {activeTab === 'admin' && 'Administração do Sistema'}
                    {activeTab === 'dashboard_admin' && 'Dashboard Geral'}
                    {activeTab === 'configuracoes' && 'Configurações'}
                  </h2>
                  <p className="text-app-text-muted mt-3 text-lg font-medium">
                    {activeTab === 'registrar' && 'Registre as habilidades e o progresso diário dos alunos.'}
                    {activeTab === 'historico' && 'Visualize e filtre todos os registros realizados.'}
                    {activeTab === 'visao_pais' && 'Acompanhe o desenvolvimento e as conquistas do seu filho.'}
                    {activeTab === 'admin' && 'Gerencie os alunos cadastrados na plataforma.'}
                    {activeTab === 'dashboard_admin' && 'Visão geral e métricas de todos os registros.'}
                    {activeTab === 'configuracoes' && 'Ajuste seu perfil e preferências de acessibilidade.'}
                  </p>
                </div>
                
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="w-12 h-12 rounded-full bg-app-surface border border-app-border/60 flex items-center justify-center text-app-text-muted hover:text-app-accent hover:bg-app-accent/10 transition-all duration-300 relative shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <Bell size={22} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-app-accent rounded-full border-2 border-app-surface"></span>
                  )}
                </button>
              </div>

            {/* MÓDULO DO PROFESSOR - REGISTRAR */}
            {activeTab === 'registrar' && appUser.role === 'professor' && (
              <>
                {alunosList.length === 0 ? (
                  <div className="bg-app-surface p-8 rounded-3xl border border-app-border text-center animate-in fade-in slide-in-from-bottom-4 shadow-lg max-w-2xl mx-auto mt-8">
                    <div className="w-20 h-20 bg-app-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users size={40} className="text-app-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-app-text mb-3">Nenhum aluno cadastrado</h3>
                    <p className="text-app-text-muted text-lg mb-8 leading-relaxed">
                      Para registrar uma observação, é necessário ter pelo menos um aluno cadastrado no sistema. 
                      Por favor, entre em contato com a coordenação para adicionar os alunos.
                    </p>
                  </div>
                ) : (
                  <RegistroForm 
                    alunosList={alunosList} 
                    appUser={appUser} 
                    showToast={showToast} 
                  />
                )}
              </>
            )}

            {/* MÓDULO DO PROFESSOR - HISTÓRICO */}
            {activeTab === 'historico' && appUser.role === 'professor' && (
              <HistoricoProfessor 
                alunosList={alunosList} 
                registros={registros} 
                appUser={appUser} 
                setRegistroToEdit={setRegistroToEdit} 
              />
            )}

            {/* MÓDULO DA FAMÍLIA */}
            {activeTab === 'visao_pais' && appUser.role === 'pai' && (
              <FamiliaDashboard 
                appUser={appUser} 
                registros={registros} 
                setRegistroToEdit={setRegistroToEdit} 
              />
            )}

            {/* MÓDULO ADMIN - DASHBOARD */}
            {activeTab === 'dashboard_admin' && appUser.role === 'admin' && (
              <AdminDashboard registros={registros} alunosCount={alunosList.length} showToast={showToast} />
            )}

            {/* MÓDULO ADMIN - ADMINISTRAÇÃO */}
            {activeTab === 'admin' && appUser.role === 'admin' && (
              <AdminAlunos 
                alunosList={alunosList} 
                appUser={appUser} 
                showToast={showToast} 
                setAlunoToDelete={setAlunoToDelete} 
              />
            )}

            {/* MÓDULO DE CONFIGURAÇÕES */}
            {activeTab === 'configuracoes' && (
              <SettingsPanel 
                appUser={appUser}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                fontSize={fontSize}
                setFontSize={setFontSize}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                showToast={showToast}
                handleLogout={handleLogout}
              />
            )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={appUser.role} />

      {/* Notification Center */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter 
            notifications={notifications} 
            onClose={() => setShowNotifications(false)} 
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50"
          >
            <div className={`px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold ${
              toast.type === 'success' ? 'bg-app-success text-app-accent-text' : 'bg-app-danger text-app-accent-text'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteAlunoModal 
        alunoToDelete={alunoToDelete} 
        setAlunoToDelete={setAlunoToDelete} 
        handleDeleteAluno={handleDeleteAluno} 
      />

      {/* Modal de Confirmação de Exclusão de Registro */}
      <DeleteRegistroModal 
        registroToDelete={registroToDelete} 
        setRegistroToDelete={setRegistroToDelete} 
        handleDeleteRegistro={handleDeleteRegistro} 
      />

      {/* Modal de Edição de Registro */}
      <EditRegistroModal 
        registroToEdit={registroToEdit} 
        setRegistroToEdit={setRegistroToEdit} 
        handleEditRegistro={handleEditRegistro} 
        setRegistroToDelete={setRegistroToDelete} 
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
