import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export interface AppUser {
  uid: string;
  role: 'professor' | 'pai' | 'admin';
  email: string;
  name: string;
  filhos?: string[];
  fcmToken?: string;
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
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
  }, [fcmToken]);

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

  return { user, appUser, loading, setAppUser };
}
