from fastapi import APIRouter

from app.schemas.provider import ProviderInfo
from app.services.connectors.registry import connector_registry

router = APIRouter()


@router.get("", response_model=list[ProviderInfo])
async def list_providers() -> list[ProviderInfo]:
    return connector_registry.list_providers()

