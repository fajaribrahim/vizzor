from app.schemas.dashboard import Dashboard


class DashboardCatalog:
    def __init__(self) -> None:
        self._dashboards = [
            Dashboard(
                id="executive-overview",
                title="Executive Overview",
                description="Top-level business performance across revenue, retention, and growth.",
                provider="tableau",
                group="Leadership",
                tags=["revenue", "growth", "kpi"],
                roles=["admin", "executive"],
                embed_url="https://public.tableau.com/views/Superstore_24/Overview",
            ),
            Dashboard(
                id="sales-performance",
                title="Sales Performance",
                description=(
                    "Pipeline, territory, and quota performance for the sales organization."
                ),
                provider="tableau",
                group="Sales",
                tags=["sales", "pipeline", "quota"],
                roles=["admin", "sales"],
                embed_url="https://public.tableau.com/views/Superstore_24/Performance",
            ),
        ]

    def list_dashboards(self) -> list[Dashboard]:
        return self._dashboards

    def get_dashboard(self, dashboard_id: str) -> Dashboard | None:
        return next(
            (dashboard for dashboard in self._dashboards if dashboard.id == dashboard_id),
            None,
        )


dashboard_catalog = DashboardCatalog()
