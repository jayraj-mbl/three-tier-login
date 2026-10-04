# Three-Tier Login Application with Docker Compose

A learning project demonstrating a browser-based login, a Node.js/Express application layer, and a MySQL database layer. Docker Compose builds the application image, starts MySQL with persistent storage, waits for the database health check, and connects the services over the Compose network.

## Architecture

```text
Browser (HTML/CSS/JS) -> Express API (Node.js) -> MySQL 8.4
       :8080                 :3000                 :3306
          |                    |                     |
          +--------- Docker Compose network --------+
```

- **Presentation:** Static login page and employee dashboard served by Express.
- **Application:** Express REST endpoints, session-based demo login, and parameterized MySQL queries.
- **Database:** MySQL `companydb` with an `employees` table and sample rows.

## Folder structure

```text
three-tier-app/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── app/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── public/
│       ├── index.html
│       ├── styles.css
│       └── app.js
└── db/
    └── init.sql
```

## Requirements

- Docker Desktop (Windows/macOS) or Docker Engine + Docker Compose plugin (Linux)
- Git (optional)

Check Docker:

```bash
docker --version
docker compose version
docker info
```

## Run locally

1. Open a terminal in the project root (the directory containing `docker-compose.yml`).
2. Copy `.env.example` to `.env` and change the demo passwords and session secret. These defaults are for local learning only.

   Windows CMD:

   ```cmd
   copy .env.example .env
   ```

   PowerShell / Git Bash / Linux:

   ```bash
   cp .env.example .env
   ```

3. Build the Node.js application image and start both services:

   ```bash
   docker compose up --build -d
   ```

4. Check service state and logs:

   ```bash
   docker compose ps
   docker compose logs -f app
   docker compose logs -f db
   ```

5. Open **http://localhost:8080** in your browser.

   Demo login is controlled by `DEMO_USERNAME` and `DEMO_PASSWORD` in `.env`. With the unmodified example file, it is `admin` / `ChangeMe123!`.

After login, the dashboard fetches employee records from MySQL and displays them in a table.

## API endpoints

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/health` | Checks application-to-DB connectivity | No |
| POST | `/api/login` | Starts a demo session | No |
| GET | `/api/me` | Returns the signed-in user | Yes |
| GET | `/api/employees` | Reads employee rows | Yes |
| POST | `/api/logout` | Ends the session | No |

Example health check:

```bash
curl http://localhost:8080/api/health
```

Expected response when the database is reachable:

```json
{"status":"ok","database":"connected"}
```

## Database

The `db/init.sql` script creates `employees` and inserts five sample employee records when the MySQL data directory is initialized for the first time. MySQL data is stored in the named volume `mysql_data`, so it survives container recreation.

Connect to MySQL from inside the database container:

```bash
docker compose exec db mysql -u appuser -p companydb
```

Enter the `MYSQL_PASSWORD` value from `.env`, then run:

```sql
SHOW TABLES;
SELECT * FROM employees;
```

The application connects to host `db` on port `3306`. Within a Compose network, services use the Compose service name (`db`), not `localhost`.

## Useful commands

```bash
# List services
docker compose ps

# Follow logs
docker compose logs -f

# Rebuild the app after changing application code
docker compose up --build -d app

# Stop and remove containers/network (keeps named DB volume)
docker compose down

# Stop and remove containers/network AND delete database data (destructive)
docker compose down -v
```

## Troubleshooting

- **App cannot connect to MySQL:** Check `docker compose ps` and `docker compose logs db app`. The app waits for the database health check; allow a short time for the first MySQL initialization.
- **Port 8080 is busy:** Change the host side of the app mapping in Compose, e.g. `8081:3000`, then open `http://localhost:8081`.
- **Login rejected:** Check `DEMO_USERNAME` and `DEMO_PASSWORD` in `.env`, then recreate the app with `docker compose up --build -d app`.
- **Sample data did not change:** MySQL initialization scripts run only when the data directory is first created. For a disposable learning database, `docker compose down -v` and then `docker compose up --build -d` will reinitialize it. This deletes stored DB data.

## Security notes

This is a **local learning/demo project, not production-ready authentication**. The demo account is configured through environment variables and is not a user table. The default Express session store is in-memory, which is not suitable for multi-instance production use. Before exposing this application, use strong secrets, HTTPS and secure cookies, a persistent session store, CSRF protection, rate limiting, robust account management, and managed secrets. Do not commit `.env` or real credentials. The MySQL port is intentionally not published to the host; access it through the Compose network or `docker compose exec`.

## Learning outcomes

- Build a custom Node.js image using a Dockerfile.
- Orchestrate application and database containers with Docker Compose.
- Use health checks and service dependencies.
- Persist MySQL data in a named volume.
- Connect containers using Compose DNS.
- Implement basic login/session flow and authenticated API calls.
- Query and render database rows in a web table.

## Author

**Jayraj M**
