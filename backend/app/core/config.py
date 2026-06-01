from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: str = Field(default="development", alias="VIZZOR_ENV")
    backend_port: int = Field(default=8000, alias="VIZZOR_BACKEND_PORT")
    frontend_url: str = Field(default="http://localhost:5173", alias="VIZZOR_FRONTEND_URL")

    auth_strategy: str = Field(default="jwt", alias="VIZZOR_AUTH_STRATEGY")
    jwt_secret: str = Field(default="change-me-to-a-long-random-string", alias="VIZZOR_JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="VIZZOR_JWT_ALGORITHM")
    jwt_expires_minutes: int = Field(default=60, alias="VIZZOR_JWT_EXPIRES_MINUTES")

    providers: str = Field(default="tableau", alias="VIZZOR_PROVIDERS")

    tableau_site_url: str | None = Field(default=None, alias="TABLEAU_SITE_URL")
    tableau_site_id: str | None = Field(default=None, alias="TABLEAU_SITE_ID")
    tableau_connected_app_client_id: str | None = Field(
        default=None,
        alias="TABLEAU_CONNECTED_APP_CLIENT_ID",
    )
    tableau_connected_app_secret_id: str | None = Field(
        default=None,
        alias="TABLEAU_CONNECTED_APP_SECRET_ID",
    )
    tableau_connected_app_secret_value: str | None = Field(
        default=None,
        alias="TABLEAU_CONNECTED_APP_SECRET_VALUE",
    )
    tableau_api_version: str = Field(default="3.21", alias="TABLEAU_API_VERSION")

    database_url: str = Field(default="sqlite:///./vizzor.db", alias="VIZZOR_DATABASE_URL")

    @field_validator("frontend_url")
    @classmethod
    def validate_frontend_url(cls, value: str) -> str:
        if not value:
            raise ValueError("VIZZOR_FRONTEND_URL cannot be empty")
        return value.rstrip("/")

    @property
    def enabled_providers(self) -> list[str]:
        return [provider.strip() for provider in self.providers.split(",") if provider.strip()]

    @property
    def cors_origins(self) -> list[str]:
        return [self.frontend_url]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
