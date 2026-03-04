# Mission 00 - Setup

## Project Setup
1. Create a new [Spring Boot 4](https://start.spring.io/) project
2. Example project name: `com.liquibase.workshop`
3. Add [Liquibase](https://docs.liquibase.com/community/get-started-5-0/install-liquibase-with-spring-boot) dependency

## Database

Add the contents below to `docker-compose.yml`:

```docker-compose
services:
  postgres:
    image: postgres:17-alpine
    container_name: liquibase-workshop-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: potion_shop
      POSTGRES_USER: workshop
      POSTGRES_PASSWORD: workshop
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U workshop -d potion_shop"]
      interval: 5s
      timeout: 5s
      retries: 12

volumes:
  postgres_data:
```

Start PostgreSQL:

```bash
docker compose up -d
docker compose ps postgres
```

## Backend Quick Run
Start the backend:

```bash
mvn spring-boot:run
```

Backend should be available at:
- `http://localhost:8080/api/status`
- `http://localhost:8080/scalar`

## Frontend Quick Run (Bun or npm)
In a new terminal, from project root:

### Option A - Bun
```bash
cd frontend
bun install
bun dev
```

### Option B - npm
```bash
cd frontend
npm install
npm run dev
```

Frontend should be available at:
- `http://localhost:5173`

The frontend is configured to call the backend on:
- `http://localhost:8080`
