from fastapi import APIRouter, HTTPException, status

from app.schemas.dashboard import Dashboard, DashboardEmbed
from app.services.catalog import dashboard_catalog
from app.services.connectors.registry import connector_registry

router = APIRouter()


@router.get("", response_model=list[Dashboard])
async def list_dashboards() -> list[Dashboard]:
    return dashboard_catalog.list_dashboards()


@router.get("/{dashboard_id}", response_model=Dashboard)
async def get_dashboard(dashboard_id: str) -> Dashboard:
    dashboard = dashboard_catalog.get_dashboard(dashboard_id)
    if dashboard is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )
    return dashboard


@router.get("/{dashboard_id}/embed", response_model=DashboardEmbed)
async def get_dashboard_embed(dashboard_id: str) -> DashboardEmbed:
    dashboard = dashboard_catalog.get_dashboard(dashboard_id)
    if dashboard is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    connector = connector_registry.get(dashboard.provider)
    if connector is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Provider '{dashboard.provider}' is not enabled",
        )

    return connector.build_embed_payload(dashboard)

