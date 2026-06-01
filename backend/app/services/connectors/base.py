from abc import ABC, abstractmethod

from app.schemas.dashboard import Dashboard, DashboardEmbed
from app.schemas.provider import ProviderInfo


class BIConnector(ABC):
    key: str
    name: str
    supports_token_signing: bool

    @abstractmethod
    def provider_info(self) -> ProviderInfo:
        raise NotImplementedError

    @abstractmethod
    def build_embed_payload(self, dashboard: Dashboard) -> DashboardEmbed:
        raise NotImplementedError

