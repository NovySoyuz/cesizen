# ─── Étape 1 : Build Maven ────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copier le pom.xml en premier pour profiter du cache des dépendances
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copier les sources et builder
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Étape 2 : Image de production légère ────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S cesizen && adduser -S cesizen -G cesizen

COPY --from=builder /app/target/*.jar app.jar

RUN chown cesizen:cesizen app.jar
USER cesizen

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]