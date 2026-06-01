# Contributing to Vizzor

Thanks for helping build Vizzor. This project is in early alpha, so focused improvements, clear issues, and small pull requests are especially valuable.

## Ways to Contribute

- report bugs with reproducible steps
- improve documentation
- add backend tests
- polish the frontend portal
- help design connector interfaces
- build provider connectors
- improve Docker and deployment workflows

## Development Setup

Copy environment values:

```bash
cp .env.example .env
```

Run with Docker:

```bash
docker compose up --build
```

Or run services manually:

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

## Quality Checks

```bash
make lint
make test
```

## Pull Request Guidelines

1. Keep pull requests focused on one logical change.
2. Add or update tests when behavior changes.
3. Update docs when configuration, APIs, or workflows change.
4. Do not commit secrets, real `.env` files, credentials, private keys, or provider tokens.
5. Write a clear PR description with what changed, why, and how you tested it.

## Commit Messages

Vizzor loosely follows Conventional Commits:

```text
feat: add Metabase connector scaffold
fix: correct dashboard embed response
docs: clarify local setup
test: cover provider registry
```

## Adding a BI Connector

Connectors implement the common backend interface in `backend/app/services/connectors/base.py`.

A connector should provide:

- provider metadata
- embed payload generation
- token signing when required
- helpful configuration errors
- tests for successful and failing paths

For larger connectors, open an issue first so maintainers can align on scope and API design.

## Code of Conduct

By participating, you agree to follow [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

