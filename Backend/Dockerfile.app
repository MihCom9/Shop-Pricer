FROM eclipse-temurin:25-jdk

WORKDIR /app

COPY app/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]