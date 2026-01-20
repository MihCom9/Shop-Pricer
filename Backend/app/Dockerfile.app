# --- Stage 1: Build Stage ---
FROM gradle:jdk25-alpine AS TEMP_BUILD_IMAGE

ENV APP_HOME=/usr/app/
WORKDIR $APP_HOME

# 1. Copy build config first (better caching)
COPY build.gradle settings.gradle $APP_HOME/
COPY gradle $APP_HOME/gradle/

# 2. Copy source code
COPY . .

# 3. Build the app
# -x test skips tests to speed up the build for this docker image
# --no-daemon ensures the process exits cleanly
RUN gradle clean build -x test --no-daemon

# --- Stage 2: Runtime Stage ---
FROM eclipse-temurin:25-jre-alpine

ENV APP_HOME=/usr/app/
WORKDIR $APP_HOME

# 4. Copy the JAR using a WILDCARD and rename it to app.jar
# This prevents errors if the version number in build.gradle changes
COPY --from=TEMP_BUILD_IMAGE $APP_HOME/build/libs/*.jar app.jar

EXPOSE 8080

# 5. Security: Run as non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 6. Run the consistently named jar
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]