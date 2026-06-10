import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cesizen.app',
  appName: 'CesiZen',
  webDir: 'dist',
  // Sur Android, le serveur embarqué sert les assets directement
  server: {
    // Permet les requêtes HTTP en clair (nécessaire en dev vers l'API locale)
    cleartext: true,
    // AndroidScheme : utilise http pour éviter les conflits CORS en dev
    androidScheme: 'http',
  },
  android: {
    // Autorise le trafic HTTP non chiffré en développement
    allowMixedContent: true,
  },
  plugins: {
    // Aucun plugin supplémentaire pour rester le plus simple possible
  },
};

export default config;
