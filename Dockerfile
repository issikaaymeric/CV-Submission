# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend /app/backend
RUN cd backend && mvn package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/cv-submission-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
