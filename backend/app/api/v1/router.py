from fastapi import APIRouter

from app.api.v1.routes import auth, dashboards, providers

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["dashboards"])
api_router.include_router(providers.router, prefix="/providers", tags=["providers"])

