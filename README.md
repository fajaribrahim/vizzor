# Vizzor

Vizzor is an open-source, self-hostable portal for BI dashboards.

It gives teams one branded, access-controlled place to browse and embed dashboards from tools like Tableau, Power BI, Metabase, Superset, and other BI providers.

Vizzor is currently in early alpha. The repository now contains the first working scaffold for a FastAPI backend, a React/Vite frontend, Docker Compose, documentation, and OSS contribution files.

## Why Vizzor?

Most BI tools can render dashboards well. The hard part starts when a team wants dashboards from multiple tools in one internal portal with shared authentication, consistent branding, role-based visibility, and provider-specific embed logic hidden behind a clean interface.

Vizzor is that glue layer.

## Current Features

- React and Vite dashboard portal shell
- FastAPI backend API
- dashboard catalog endpoint
- provider registry endpoint
- Tableau connector placeholder
- local JWT demo login endpoint
- Docker Compose development environment
- GitHub issue templates, PR template, CI workflow, and OSS docs

## Target Features

- persistent dashboard catalog
- pluggable auth with JWT, OAuth, and OIDC
- Tableau Connected Apps token signing
- role-based dashboard visibility
- Power BI connector
- Metabase connector
- Superset connector
- light, dark, and brand theme tokens
- self-hosted production deployment guide

## Repository Structure

```text
.
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # settings and security helpers
│   │   ├── schemas/         # Pydantic models
│   │   └── services/        # catalog and BI connectors
│   └── tests/
├── frontend/                # React and Vite frontend
│   └── src/
├── docs/                    # architecture, development, roadmap, connectors
├── .github/                 # issue templates, PR template, CI
├── docker-compose.yml
├── Makefile
└── .env.example
```

## Architecture

```text
Browser
  |
  | HTTPS / local dev proxy
  v
Frontend: React + Vite
  |
  | REST JSON
  v
Backend: FastAPI
  |
  | Connector interface
  v
BI providers: Tableau, Power BI, Metabase, Superset, ...
```

The frontend owns the portal experience. The backend owns trusted responsibilities such as auth strategy coordination, connector selection, dashboard catalog access, and provider token signing.

## Quick Start

### Prerequisites

- Node.js 20 or newer
- Python 3.11 or newer
- Docker and Docker Compose, optional but recommended

### Configure

```bash
cp .env.example .env
```

### Run with Docker

```bash
docker compose up --build
```

Open `http://localhost:5173`.

### Run Manually

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Preview

- `GET /health`
- `GET /api/v1/providers`
- `GET /api/v1/dashboards`
- `GET /api/v1/dashboards/{dashboard_id}`
- `GET /api/v1/dashboards/{dashboard_id}/embed`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Demo login:

- email: `admin@vizzor.local`
- password: `vizzor`

The demo login is only for local alpha development.

## Development

```bash
make lint
make test
```

More details:

- [Development](./docs/development.md)
- [Architecture](./docs/architecture.md)
- [Connectors](./docs/connectors.md)
- [Roadmap](./docs/roadmap.md)

## Contributing

Contributions are welcome. Good first areas include docs, frontend polish, backend tests, connector design, and deployment examples.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Security

Do not commit real `.env` files, private keys, BI provider secrets, OAuth secrets, or exported private dashboard data.

Read [SECURITY.md](./SECURITY.md) for the current alpha security policy.

## License

[MIT](./LICENSE) © Fajar Ibrahim

