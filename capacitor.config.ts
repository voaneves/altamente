import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.altamente.app',
  appName: 'Altamente',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'SEU_CLIENT_ID_WEB_AQUI.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
