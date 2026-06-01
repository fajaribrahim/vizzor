import {
  BarChart3,
  CircleUserRound,
  Filter,
  LayoutDashboard,
  Moon,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchDashboardEmbed, fetchDashboards, fetchProviders } from "./api";
import type { Dashboard, DashboardEmbed, ProviderInfo } from "./types";

const fallbackDashboards: Dashboard[] = [
  {
    id: "executive-overview",
    title: "Executive Overview",
    description: "Top-level business performance across revenue, retention, and growth.",
    provider: "tableau",
    group: "Leadership",
    tags: ["revenue", "growth", "kpi"],
    roles: ["admin", "executive"],
    embed_url: "https://public.tableau.com/views/Superstore_24/Overview",
  },
  {
    id: "sales-performance",
    title: "Sales Performance",
    description: "Pipeline, territory, and quota performance for the sales organization.",
    provider: "tableau",
    group: "Sales",
    tags: ["sales", "pipeline", "quota"],
    roles: ["admin", "sales"],
    embed_url: "https://public.tableau.com/views/Superstore_24/Performance",
  },
];

const fallbackProviders: ProviderInfo[] = [
  {
    key: "tableau",
    name: "Tableau",
    status: "alpha",
    supports_token_signing: true,
  },
];

function App() {
  const [dashboards, setDashboards] = useState<Dashboard[]>(fallbackDashboards);
  const [providers, setProviders] = useState<ProviderInfo[]>(fallbackProviders);
  const [activeDashboardId, setActiveDashboardId] = useState(fallbackDashboards[0].id);
  const [activeEmbed, setActiveEmbed] = useState<DashboardEmbed | null>(null);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [status, setStatus] = useState<"ready" | "loading" | "offline">("loading");

  const activeDashboard = useMemo(
    () => dashboards.find((dashboard) => dashboard.id === activeDashboardId) ?? dashboards[0],
    [activeDashboardId, dashboards],
  );

  const filteredDashboards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return dashboards;
    }

    return dashboards.filter((dashboard) => {
      const searchable = [
        dashboard.title,
        dashboard.description,
        dashboard.provider,
        dashboard.group,
        ...dashboard.tags,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [dashboards, query]);

  async function loadData() {
    setStatus("loading");
    try {
      const [nextDashboards, nextProviders] = await Promise.all([
        fetchDashboards(),
        fetchProviders(),
      ]);

      setDashboards(nextDashboards);
      setProviders(nextProviders);
      setActiveDashboardId((current) => {
        if (nextDashboards.some((dashboard) => dashboard.id === current)) {
          return current;
        }
        return nextDashboards[0]?.id ?? current;
      });
      setStatus("ready");
    } catch {
      setDashboards(fallbackDashboards);
      setProviders(fallbackProviders);
      setStatus("offline");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!activeDashboard) {
      return;
    }

    fetchDashboardEmbed(activeDashboard.id)
      .then(setActiveEmbed)
      .catch(() => {
        setActiveEmbed({
          dashboard_id: activeDashboard.id,
          provider: activeDashboard.provider,
          embed_type: "iframe",
          embed_url: activeDashboard.embed_url,
          token: null,
          options: {},
        });
      });
  }, [activeDashboard]);

  const providerCount = providers.length;
  const dashboardCount = dashboards.length;
  const roleCount = new Set(dashboards.flatMap((dashboard) => dashboard.roles)).size;

  return (
    <main className={`app app--${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <BarChart3 size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="brand-kicker">Vizzor</p>
            <h1>Dashboard Portal</h1>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <button className="nav-item nav-item--active" type="button">
            <LayoutDashboard size={18} aria-hidden="true" />
            Dashboards
          </button>
          <button className="nav-item" type="button">
            <ShieldCheck size={18} aria-hidden="true" />
            Access
          </button>
        </nav>

        <div className="sidebar-footer">
          <CircleUserRound size={18} aria-hidden="true" />
          <div>
            <strong>Admin</strong>
            <span>JWT demo session</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Self-hosted BI cockpit</p>
            <h2>{activeDashboard?.title ?? "Dashboards"}</h2>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              title="Refresh catalog"
              aria-label="Refresh catalog"
              onClick={() => void loadData()}
            >
              <RefreshCw size={18} aria-hidden="true" />
            </button>
            <button
              className="icon-button"
              type="button"
              title="Toggle theme"
              aria-label="Toggle theme"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? (
                <Moon size={18} aria-hidden="true" />
              ) : (
                <Sun size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        <section className="summary-grid" aria-label="Portal summary">
          <div className="metric">
            <span>Dashboards</span>
            <strong>{dashboardCount}</strong>
          </div>
          <div className="metric">
            <span>Providers</span>
            <strong>{providerCount}</strong>
          </div>
          <div className="metric">
            <span>Roles</span>
            <strong>{roleCount}</strong>
          </div>
          <div className="metric">
            <span>Status</span>
            <strong>{status}</strong>
          </div>
        </section>

        <section className="content-grid">
          <div className="catalog-panel">
            <div className="panel-toolbar">
              <label className="search-field">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search dashboards"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button className="icon-button" type="button" title="Filter" aria-label="Filter">
                <Filter size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="dashboard-list">
              {filteredDashboards.map((dashboard) => (
                <button
                  className={
                    dashboard.id === activeDashboard?.id
                      ? "dashboard-row dashboard-row--active"
                      : "dashboard-row"
                  }
                  type="button"
                  key={dashboard.id}
                  onClick={() => setActiveDashboardId(dashboard.id)}
                >
                  <span className="dashboard-row__meta">
                    <strong>{dashboard.title}</strong>
                    <small>{dashboard.group}</small>
                  </span>
                  <span className="provider-pill">{dashboard.provider}</span>
                </button>
              ))}
            </div>
          </div>

          <article className="viewer">
            <div className="viewer-header">
              <div>
                <p>{activeDashboard?.description}</p>
                <div className="tag-row">
                  {activeDashboard?.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
              <span className="provider-pill provider-pill--large">
                {activeDashboard?.provider ?? "provider"}
              </span>
            </div>

            <div className="embed-shell">
              {activeEmbed ? (
                <iframe
                  title={activeDashboard?.title}
                  src={activeEmbed.embed_url}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="embed-empty">Loading dashboard</div>
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

export default App;

