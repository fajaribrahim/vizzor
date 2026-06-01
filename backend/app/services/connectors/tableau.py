from app.schemas.dashboard import Dashboard, DashboardEmbed
from app.schemas.provider import ProviderInfo
from app.services.connectors.base import BIConnector


class TableauConnector(BIConnector):
    key = "tableau"
    name = "Tableau"
    supports_token_signing = True

    def provider_info(self) -> ProviderInfo:
        return ProviderInfo(
            key=self.key,
            name=self.name,
            status="alpha",
            supports_token_signing=self.supports_token_signing,
        )

    def build_embed_payload(self, dashboard: Dashboard) -> DashboardEmbed:
        return DashboardEmbed(
            dashboard_id=dashboard.id,
            provider=self.key,
            embed_type="iframe",
            embed_url=dashboard.embed_url,
            token=None,
            options={
                "toolbar": False,
                "tabs": False,
            },
        )

