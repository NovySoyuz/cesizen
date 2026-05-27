### Règles GitFlow à respecter
- Toute `feature/*` part de `develop` et y revient via PR
- `main` ← `develop` uniquement lors d'une livraison (tag `v0.x.0`)
- Les branches `docs/*` sont des branches longues, on y pousse au fil de l'eau
- **Ne jamais commiter directement sur `main` ou `develop`**

---

## ✅ Plan de développement — Étapes

### PHASE 0 — Infrastructure & Monorepo
- [ ] **0.1** Créer la branche `feature/monorepo-setup`
- [ ] **0.2** Déplacer le contenu Spring Boot dans `apps/api/`
- [ ] **0.3** Adapter le `Dockerfile` de l'API (`context: apps/api`)
- [ ] **0.4** Créer `apps/web/` avec Vite + React + TypeScript (`npm create vite@latest`)
- [ ] **0.5** Créer `apps/web/Dockerfile` (build nginx multi-stage)
- [ ] **0.6** Mettre à jour `docker-compose.yml` (contexts `apps/api` et `apps/web`)
- [ ] **0.7** Mettre à jour le `Makefile` (commandes front)
- [ ] **0.8** Vérifier `make up-full` → les 3 conteneurs démarrent
- [ ] **0.9** Merge `feature/monorepo-setup` → `develop`

---

### PHASE 1 — Module Comptes Utilisateurs (Obligatoire)
> Branche : `feature/auth`

#### Back (apps/api)
- [ ] **1.1** Entité `Utilisateur` + Repository JPA
- [ ] **1.2** `UserDetailsService` pour Spring Security
- [ ] **1.3** `JwtUtil` (génération + validation du token JWT HS256)
- [ ] **1.4** `JwtFilter` (filtre Spring Security)
- [ ] **1.5** `SecurityConfig` (CSRF off, stateless, routes publiques)
- [ ] **1.6** `AuthController` → `POST /api/auth/register` + `POST /api/auth/login`
- [ ] **1.7** `UserController` → `GET /api/users/me`, `PUT /api/users/me`, `DELETE /api/users/{id}` (admin)
- [ ] **1.8** DTOs (`RegisterRequest`, `LoginRequest`, `AuthResponse`, `UserDto`)
- [ ] **1.9** Gestion des exceptions globales (`@ControllerAdvice`)
- [ ] **1.10** Tests unitaires `AuthService`, `JwtUtil`
- [ ] **1.11** Tests d'intégration `AuthController` (MockMvc)

#### Front (apps/web)
- [ ] **1.12** Page `/register` (formulaire création de compte)
- [ ] **1.13** Page `/login` (formulaire connexion + stockage JWT en `localStorage`)
- [ ] **1.14** `AuthContext` (React Context — état global de l'utilisateur)
- [ ] **1.15** Composant `ProtectedRoute` (redirection si non connecté)
- [ ] **1.16** Page `/profile` (affichage + modification du compte)
- [ ] **1.17** Merge `feature/auth` → `develop`

---

### PHASE 2 — Module Informations (Obligatoire)
> Branche : `feature/informations`

#### Back
- [ ] **2.1** Entité `Page` (titre, contenu HTML, slug, est_actif)
- [ ] **2.2** Migration Liquibase `V008__create_page.xml`
- [ ] **2.3** `PageController` → `GET /api/pages` (public), `GET /api/pages/{slug}` (public), `PUT /api/pages/{id}` (admin)
- [ ] **2.4** Tests unitaires + intégration

#### Front
- [ ] **2.5** Page d'accueil `/` avec contenu dynamique
- [ ] **2.6** Page générique `/info/:slug`
- [ ] **2.7** Interface admin pour modifier les pages (éditeur de texte simple)
- [ ] **2.8** Merge `feature/informations` → `develop`

---

### PHASE 3 — Module Diagnostics (Module au choix)
> Branche : `feature/diagnostics`

#### Back
- [ ] **3.1** Les entités sont déjà migrées (V002 → V007 ✅)
- [ ] **3.2** Entités JPA : `Questionnaire`, `Question`, `OptionReponse`, `Interpretation`, `Diagnostic`, `ChoixUtilisateur`
- [ ] **3.3** `QuestionnaireController` → `GET /api/questionnaires/{id}` (public)
- [ ] **3.4** `DiagnosticController` → `POST /api/diagnostics` (calcul du score + interprétation)
- [ ] **3.5** `AdminQuestionnaireController` → CRUD questionnaire (admin)
- [ ] **3.6** Logique de calcul du score dans un `DiagnosticService`
- [ ] **3.7** Historique → `GET /api/diagnostics/me` (connecté uniquement)
- [ ] **3.8** Tests unitaires `DiagnosticService` (calcul score, interprétation)
- [ ] **3.9** Tests d'intégration

#### Front
- [ ] **3.10** Page `/diagnostic` — affichage du questionnaire (étape par étape)
- [ ] **3.11** Page `/diagnostic/resultat` — affichage score + message interprétation
- [ ] **3.12** Page `/historique` (connecté) — liste des diagnostics passés
- [ ] **3.13** Interface admin CRUD questionnaire
- [ ] **3.14** Merge `feature/diagnostics` → `develop`

---

### PHASE 4 — Tests & Qualité
> Branche : `test/unit-auth`, `test/unit-diagnostics`, `test/integration`

- [ ] **4.1** Compléter les tests unitaires (couverture > 70%)
- [ ] **4.2** Tests fonctionnels MockMvc pour chaque controller
- [ ] **4.3** Tests de non régression (scénarios de bout en bout)
- [ ] **4.4** Vérifier le rapport Surefire (`make test-report`)

---

### PHASE 5 — Documentation
> Branche : `docs/technical` + `docs/recette`

- [ ] **5.1** MLD (Modèle Logique de Données) — schéma exporté
- [ ] **5.2** Comparatif 3 architectures (MVC monolithique / API REST / Microservices)
- [ ] **5.3** Guide d'installation (Docker, local, variables d'environnement)
- [ ] **5.4** Cahier de tests (modules Auth + Infos + Diagnostics)
- [ ] **5.5** Procédure de validation + modèle PV de recette

---

### PHASE 6 — Livraison
- [ ] **6.1** Merge `develop` → `main`
- [ ] **6.2** Tag `v1.0.0`
- [ ] **6.3** Vérification `make up-full` en conditions "production"
- [ ] **6.4** Relecture dossier (15-20 pages)

---

## 🛠️ Stack technique retenue

| Composant | Technologie |
|---|---|
| Backend | Spring Boot 3.4.5 / Java 21 |
| ORM | Spring Data JPA / Hibernate |
| Migrations DB | Liquibase |
| Sécurité | Spring Security + JWT (jjwt 0.12.6) |
| Base de données | MySQL 8.4 |
| Frontend | React + Vite + TypeScript | tailwind | Le Design Système de l'État Français (DSFR)
| Containerisation | Docker / Docker Compose |
| Tests | JUnit 5 + Mockito + MockMvc + H2 (in-memory) |
| Build | Maven (API) / npm (web) |

---

## 🔑 Variables d'environnement (.env à la racine)

```env
DB_NAME=cesizen
DB_USER=cesizen
DB_PASSWORD=cesizen
MYSQL_ROOT_PASSWORD=rootpassword
JWT_SECRET=cesizen-super-secret-key-change-in-production-min-256bits