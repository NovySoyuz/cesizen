# 📱 CesiZen — Application Mobile (Capacitor)

Capacitor transforme le build web Vite/React en application Android native **sans réécrire le code**.

---

## Architecture

```
apps/web/
├── capacitor.config.ts   ← Config Capacitor (appId, webDir, cleartext…)
├── android/              ← Projet Android Studio généré automatiquement
│   └── app/src/main/
│       ├── assets/public/  ← Le build Vite est copié ici
│       └── AndroidManifest.xml
├── dist/                 ← Build web (source pour Capacitor)
└── src/
    └── api/
        └── axiosInstance.ts  ← URL API adaptée selon la plateforme
```

---

## Workflow de développement

### 1. Premier démarrage

```bash
# Depuis apps/web/
npm install
npm run mobile:build     # = npm run build + npx cap sync android
npm run mobile:open      # ouvre Android Studio
```

### 2. Après chaque modification du code

```bash
npm run mobile:build     # rebuild + resync
# Puis relancer depuis Android Studio (bouton ▶)
```

### 3. Commandes utiles

| Commande | Action |
|---|---|
| `npm run mobile:build` | Build web → sync Android |
| `npm run mobile:open` | Ouvre Android Studio |
| `npm run mobile:run` | Lance sur émulateur/appareil connecté (nécessite adb) |
| `npx cap sync android` | Sync seul (sans rebuild) |

---

## Prérequis

| Outil | Version minimale | Lien |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| JDK | 17+ | https://adoptium.net |
| Android Studio | Hedgehog+ | https://developer.android.com/studio |
| Android SDK | API 22+ | via Android Studio SDK Manager |

> ⚠️ Vérifiez que la variable d'environnement `ANDROID_HOME` est définie  
> (ex : `C:\Users\<vous>\AppData\Local\Android\Sdk`)

---

## Configuration de l'URL de l'API

Le fichier `src/api/axiosInstance.ts` détecte automatiquement la plateforme :

| Plateforme | URL utilisée |
|---|---|
| Navigateur web | `VITE_API_URL` ou `http://localhost:8080` |
| Émulateur Android | `http://10.0.2.2:8080` ← loopback vers la machine hôte |
| Appareil Android physique | Modifier `capacitor.config.ts` > `server.url` |

### Appareil physique (USB)

1. Trouvez votre IP locale : `ipconfig` → adresse IPv4
2. Dans `capacitor.config.ts`, ajoutez :
   ```ts
   server: {
     url: 'http://192.168.x.x:5173', // pour Live Reload
     cleartext: true,
   }
   ```
3. Assurez-vous que l'API backend écoute sur `0.0.0.0:8080`

---

## Test sur émulateur Android

### Étape 1 — Démarrer le backend

```bash
# Depuis la racine du projet
docker-compose up -d   # ou : cd apps/api && ./mvnw spring-boot:run
```

### Étape 2 — Build et sync

```bash
cd apps/web
npm run mobile:build
```

### Étape 3 — Ouvrir Android Studio

```bash
npm run mobile:open
```

1. Attendez que Gradle finisse de synchroniser (barre de progression en bas)
2. Sélectionnez un AVD (émulateur) dans le menu déroulant en haut
3. Cliquez sur **▶ Run**

### Étape 4 — Vérifications dans l'app

- [ ] La page d'accueil s'affiche correctement
- [ ] La navigation fonctionne (menu hamburger ou tabs)
- [ ] La page `/connexion` est accessible
- [ ] La connexion avec un compte existant fonctionne
- [ ] Le diagnostic PSS peut être lancé
- [ ] Les pages informations s'affichent

---

## Dépannage fréquent

| Problème | Solution |
|---|---|
| Écran blanc au démarrage | Vérifier que `dist/` existe (`npm run build`) |
| `ERR_CLEARTEXT_NOT_PERMITTED` | Vérifier `usesCleartextTraffic="true"` dans AndroidManifest.xml |
| Impossible de joindre l'API | Utiliser `10.0.2.2:8080` (émulateur) ou l'IP LAN (physique) |
| Gradle sync échoue | File > Invalidate Caches & Restart dans Android Studio |
| `ANDROID_HOME not set` | Définir la variable dans les variables d'environnement système |

---

## Structure du projet Android généré

```
android/
├── app/
│   ├── src/main/
│   │   ├── assets/public/   ← Votre app web buildée
│   │   ├── java/com/cesizen/app/
│   │   │   └── MainActivity.java
│   │   └── res/             ← Icônes, styles…
│   └── build.gradle
├── capacitor.settings.gradle
└── gradle/
```

---

## Icônes et Splash Screen (optionnel)

Pour personnaliser les icônes :
```bash
npm install @capacitor/assets --save-dev
# Placer une image 1024x1024 dans assets/icon.png
npx capacitor-assets generate --android
```

