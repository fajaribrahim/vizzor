# Development

## Prerequisites

- Node.js 20 or newer
- Python 3.11 or newer
- Docker and Docker Compose, optional but recommended

## Local Setup

Copy environment values:

```bash
cp .env.example .env
```

Run everything with Docker:

```bash
docker compose up --build
```

Run services manually:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo Login

The alpha backend includes a local-only demo login:

- email: `admin@vizzor.local`
- password: `vizzor`

Replace this before production use.

## Quality Checks

```bash
make lint
make test
```

