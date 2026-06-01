from app.core.config import settings
from app.schemas.provider import ProviderInfo
from app.services.connectors.base import BIConnector
from app.services.connectors.tableau import TableauConnector


class ConnectorRegistry:
    def __init__(self) -> None:
        candidates: list[BIConnector] = [TableauConnector()]
        self._connectors = {
            connector.key: connector
            for connector in candidates
            if connector.key in settings.enabled_providers
        }

    def get(self, provider: str) -> BIConnector | None:
        return self._connectors.get(provider)

    def list_providers(self) -> list[ProviderInfo]:
        return [connector.provider_info() for connector in self._connectors.values()]


connector_registry = ConnectorRegistry()

