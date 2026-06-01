# Architecture

Vizzor is a two-tier application with a frontend portal and a backend orchestrator.

## Frontend

The frontend is a React and Vite application. It owns the dashboard portal experience:

- dashboard catalog browsing
- search and filtering
- provider badges and metadata
- dashboard embed container
- theme switching

The frontend talks to the backend over JSON APIs under `/api/v1`.

## Backend

The backend is a FastAPI service. It owns trusted server-side responsibilities:

- authentication strategy coordination
- dashboard catalog access
- BI provider connector registry
- embed payload generation
- provider token signing where required

## Connector Boundary

Connectors adapt provider-specific embedding requirements into a common Vizzor response shape.

The frontend should not need to know whether a dashboard came from Tableau, Power BI, Metabase, or another provider. Provider-specific details belong in backend connectors.

## Target Flow

1. A user signs in through the configured auth strategy.
2. The frontend requests visible dashboards from the backend.
3. The user opens a dashboard.
4. The backend builds an embed payload through the matching connector.
5. The frontend renders the dashboard using the returned payload.

