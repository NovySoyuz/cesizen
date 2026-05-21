.PHONY: help up up-full down restart build logs ps clean test db-shell dev-api dev-web

# Couleurs
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RESET  := \033[0m

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# ─── Docker ──────────────────────────────────────────────────────

up: ## Démarre DB + API
	docker compose up -d cesizen-db cesizen-api

up-full: ## Démarre DB + API + Front
	docker compose --profile front up -d
	@echo Front : http://localhost:3000
	@echo Back  : http://localhost:8080

down: ## Arrête et supprime les conteneurs
	docker compose down
	docker compose --profile front down

restart: ## Redémarre tous les conteneurs
	docker compose restart

build: ## Reconstruit les images Docker
	docker compose build --no-cache

logs: ## Affiche les logs en temps réel
	docker compose logs -f

logs-api: ## Logs de l'API uniquement
	docker compose logs -f cesizen-api

logs-web: ## Logs du Front uniquement
	docker compose logs -f cesizen-web

logs-db: ## Logs de la DB uniquement
	docker compose logs -f cesizen-db

ps: ## Affiche l'état des conteneurs
	docker compose ps

clean: ## Supprime conteneurs, volumes et images
	docker compose down -v --rmi local

# ─── Base de données ─────────────────────────────────────────────

db-up: ## Démarre uniquement la base de données
	docker compose up -d cesizen-db

db-shell: ## Ouvre un shell MySQL
	docker exec -it cesizen-db mysql -u cesizen -pcesizen cesizen

db-reset: ## Supprime et recrée le volume de la BDD (⚠️ perte de données)
	docker compose down -v
	docker compose up -d cesizen-db

# ─── Maven (API) ─────────────────────────────────────────────────

test: ## Lance les tests unitaires
	cd apps/api && ./mvnw test

test-report: ## Lance les tests et ouvre le rapport
	cd apps/api && ./mvnw test

build-jar: ## Compile le JAR sans les tests
	cd apps/api && ./mvnw clean package -DskipTests

# ─── Dev local (sans Docker) ─────────────────────────────────────

dev-api: db-up ## Lance l'API en local (Java 21 requis)
	cd apps/api && ./mvnw spring-boot:run

dev-web: ## Lance le front en local (hot-reload sur http://localhost:5173)
	cd apps/web && npm run dev

