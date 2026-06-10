# CESIZen

> Application web & mobile de bien-être mental à destination des étudiants CESI.  
> Elle propose des ressources informatives, un diagnostic de stress et la gestion de comptes utilisateurs avec des rôles différenciés.

---

## 🗂 Stack technique

| Couche | Technologie |
|---|---|
| **Backend** | Java 21 · Spring Boot 3.4 · Spring Security · JWT · JPA/Hibernate · Liquibase |
| **Base de données** | MySQL 8.4 |
| **Frontend** | React 18 · TypeScript · Vite · React Router 6 · DSFR |
| **Mobile** | Capacitor 8 (Android) |
| **Infrastructure** | Docker · Docker Compose |

---

## 📁 Structure du projet

```
cesizen/
├── apps/
│   ├── api/          # Backend Spring Boot (port 8080)
│   └── web/          # Frontend React + projet Android Capacitor (port 5173/3000)
├── docs/             # Documentation technique
├── docker-compose.yml
└── Makefile          # Commandes raccourcies
```

---

## 🚀 Démarrage rapide (Docker)

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd cesizen
```

### 2. Lancer DB + API
```bash
docker compose up -d cesizen-db cesizen-api
```

### 3. Lancer avec le frontend (optionnel)
```bash
docker compose --profile front up -d
```

| Service | URL |
|---|---|
| API REST | http://localhost:8080 |
| Frontend | http://localhost:3000 |
| MySQL | localhost:**3307** |

---

## ⚙️ Variables d'environnement

Les valeurs par défaut fonctionnent en développement. Pour la production, créer un fichier `.env` à la racine :

```env
DB_NAME=cesizen
DB_USER=cesizen
DB_PASSWORD=cesizen
MYSQL_ROOT_PASSWORD=rootpassword
JWT_SECRET=votre-secret-jwt-min-256bits
```

---

## 🛠 Commandes Makefile

```bash
make up            # Démarre DB + API
make up-full       # Démarre DB + API + Frontend
make down          # Arrête tout
make logs          # Logs en temps réel
make logs-api      # Logs API uniquement
make rebuild-api   # Recompile et redémarre l'API
make rebuild-front # Rebuild le frontend
make rebuild-all   # Rebuild complet
make test          # Lance les tests unitaires
make db-shell      # Accès shell MySQL
make db-reset      # ⚠️ Réinitialise la base de données
```

---

## 💻 Développement local (sans Docker)

### Backend
> Prérequis : Java 21, Maven — la DB doit tourner via Docker (`make db-up`)

```bash
cd apps/api
./mvnw spring-boot:run
```

### Frontend
> Prérequis : Node.js 18+

```bash
cd apps/web
npm install
npm run dev   # http://localhost:5173
```

---

## 📱 Application mobile (Android)

> Prérequis : Android Studio installé

```bash
cd apps/web

# 1. Builder et synchroniser le projet Android
npm run mobile:build

# 2. Ouvrir dans Android Studio
npm run mobile:open

# 3. (Optionnel) Lancer directement sur un émulateur
npm run mobile:run
```

> Sur l'émulateur Android, l'API est accessible via `10.0.2.2:8080` (géré automatiquement).

---

## 🔐 Rôles utilisateurs

| Rôle | Accès |
|---|---|
| `ROLE_USER` | Lecture des pages, diagnostic, historique personnel |
| `ROLE_MODERATOR` | + Création / modification des pages d'information |
| `ROLE_ADMIN` | + Gestion des utilisateurs (activation, rôles, suppression) |

---

## 🗄 Principaux endpoints API

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/pages` | Public |
| `GET` | `/api/questionnaires` | Public |
| `POST` | `/api/diagnostics` | Public |
| `GET` | `/api/diagnostics/history` | Authentifié |
| `GET` | `/api/users/me` | Authentifié |
| `PUT` | `/api/pages/{id}` | Admin |
| `GET` | `/api/users` | Admin |

---

## 🧪 Tests

```bash
# Via Makefile
make test

# Via Maven directement
cd apps/api
./mvnw test
```

Les tests utilisent une base **H2 en mémoire** (profil `test`), configurée dans `src/test/resources/application-test.properties`.

---

## 📚 Documentation

La documentation complète est disponible dans le dossier [`docs/`](./docs/) :

- [`documentation-technique.md`](./docs/documentation-technique.md) — MLD, comparatif technique, guide d'installation, cahier de tests, PV de recette
- [`architecture-back.md`](./docs/architecture-back.md) — Architecture backend
- [`architecture-front.md`](./docs/architecture-front.md) — Architecture frontend
