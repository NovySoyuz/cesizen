.PHONY: help up up-full down restart build logs ps clean test db-shell dev-api dev-web rebuild-api rebuild-front rebuild-all sonar-up sonar-down sonar-logs sonar-scan sonar sonar-api sonar-web

# Couleurs
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RESET  := \033[0m

# Charge les variables du fichier .env (SONAR_TOKEN, SONAR_HOST_URL, ...)
ifneq (,$(wildcard ./.env))
	include .env
	export
endif

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# ─── Docker ──────────────────────────────────────────────────────

up: ## Démarre DB + API
	docker compose up -d cesizen-db cesizen-api cesizen-web

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

db-reset: ## Supprime et recrée le volume de la BDD (⚠️ perte de données)
	docker compose down -v
	docker compose up -d cesizen-db

# ─── Maven (API) ─────────────────────────────────────────────────

test: ## Lance les tests unitaires
	cd apps/api && mvnw.cmd test

test-report: ## Lance les tests et ouvre le rapport
	cd apps/api && mvnw.cmd test

build-jar: ## Compile le JAR sans les tests
	cd apps/api && mvnw.cmd clean package -DskipTests

rebuild-api: ## ⚡ Rebuild API uniquement (JAR + Docker)
	cd apps/api && mvnw.cmd clean package -DskipTests
	docker compose build --no-cache cesizen-api
	docker compose up -d --force-recreate cesizen-api
	@echo Back : http://localhost:8080

# ─── front ───────────────────────────────────────────────────────

rebuild-front: ## ⚡ Rebuild Front uniquement (npm + Docker)
	docker compose build --no-cache cesizen-web
	docker compose --profile front up -d --force-recreate cesizen-web
	@echo Front : http://localhost:3000

rebuild-all: ## ⚡ Rebuild complet API + Front
	cd apps/api && mvnw.cmd clean package -DskipTests
	docker compose build --no-cache cesizen-web cesizen-api
	docker compose --profile front up -d --force-recreate cesizen-web cesizen-api
	docker compose up -d --force-recreate cesizen-web cesizen-api
	@echo Front : http://localhost:3000
	@echo Back  : http://localhost:8080
# ─── Dev local (sans Docker) ─────────────────────────────────────

dev-api: db-up ## Lance l'API en local (Java 21 requis)
	cd apps/api && ./mvnw spring-boot:run

dev-web: ## Lance le front en local (hot-reload sur http://localhost:5173)
	cd apps/web && npm run dev

# ─── SonarQube (analyse de qualité de code) ──────────────────────

sonar-up: ## Démarre SonarQube (+ sa base Postgres)
	docker compose --profile sonar up -d sonarqube-db sonarqube
	@echo "SonarQube starting... wait ~30-60s then open http://localhost:$${SONAR_PORT:-9000} (default login/pass: admin/admin)"

sonar-down: ## Arrête SonarQube
	docker compose --profile sonar down

sonar-api: ## Lance les tests + génère le rapport de couverture Jacoco (API)
	cd apps/api && ./mvnw.cmd clean test

sonar-scan: sonar-api ## Lance l'analyse SonarQube (nécessite SONAR_TOKEN dans .env)
	@if [ -z "$$SONAR_TOKEN" ]; then \
		echo "$(YELLOW)WARNING: SONAR_TOKEN missing in .env. Generate it at http://localhost:$${SONAR_PORT:-9000} (My Account > Security) then retry.$(RESET)"; \
		exit 1; \
	fi
	docker run --rm --network cesizen-network \
		-e SONAR_HOST_URL="http://cesizen-sonarqube:9000" \
		-e SONAR_TOKEN="$$SONAR_TOKEN" \
		-v "$(CURDIR):/usr/src" \
		sonarsource/sonar-scanner-cli

sonar: sonar-up ## ⚡ Démarre SonarQube (si besoin) puis lance l'analyse complète (API + Web)
	@$(MAKE) sonar-scan

