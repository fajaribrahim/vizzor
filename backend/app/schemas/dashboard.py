from pydantic import BaseModel, Field, HttpUrl


class Dashboard(BaseModel):
    id: str
    title: str
    description: str
    provider: str
    group: str
    tags: list[str]
    roles: list[str]
    embed_url: HttpUrl


class DashboardEmbed(BaseModel):
    dashboard_id: str
    provider: str
    embed_type: str
    embed_url: HttpUrl
    token: str | None = None
    options: dict[str, str | bool | int] = Field(default_factory=dict)
