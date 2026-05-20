.PHONY: help up down restart build logs ps clean test db-shell api-shell

# Couleurs
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RESET  := \033[0m

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# ─── Docker ──────────────────────────────────────────────────────

up: ## Démarre tous les conteneurs (db + api)
	docker compose up -d

up-full: ## Démarre tous les conteneurs dont le front
	docker compose --profile front up -d

down: ## Arrête et supprime les conteneurs
	docker compose down

restart: ## Redémarre tous les conteneurs
	docker compose restart

build: ## Reconstruit les images Docker
	docker compose build --no-cache

logs: ## Affiche les logs en temps réel
	docker compose logs -f

logs-api: ## Affiche les logs de l'API uniquement
	docker compose logs -f cesizen

logs-db: ## Affiche les logs de la BDD uniquement
	docker compose logs -f cesizen-db

ps: ## Affiche l'état des conteneurs
	docker compose ps

clean: ## Supprime les conteneurs, volumes et images
	docker compose down -v --rmi local

# ─── Base de données ─────────────────────────────────────────────

db-up: ## Démarre uniquement la base de données
	docker compose up -d cesizen-db

db-shell: ## Ouvre un shell MySQL
	docker exec -it cesizen-db mysql -u cesizen -pcesizen_secret cesizen

db-reset: ## Supprime et recrée le volume de la BDD (⚠️ perte de données)
	docker compose down -v
	docker compose up -d cesizen-db

# ─── Maven ───────────────────────────────────────────────────────

test: ## Lance les tests unitaires
	./mvnw test

test-report: ## Lance les tests et ouvre le rapport
	./mvnw test && start target/surefire-reports/index.html

build-jar: ## Compile le JAR sans les tests
	./mvnw clean package -DskipTests

# ─── Dev local (sans Docker) ─────────────────────────────────────

dev: db-up ## Lance l'API en local (nécessite Java 21)
	./mvnw spring-boot:run