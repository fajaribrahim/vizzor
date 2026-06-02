import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  DatabaseZap,
  LayoutDashboard,
  LogOut,
  Moon,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { fetchDashboardEmbed, fetchDashboards, fetchProviders } from "./api";
import type { Dashboard, DashboardEmbed, ProviderInfo } from "./types";

type View = "dashboards" | "viewer" | "access" | "connectors" | "settings";
type Theme = "light" | "dark";
type Palette = "navy" | "forest" | "slate" | "indigo";
type ProviderKey = "all" | "tableau" | "metabase" | "powerbi" | "superset";
type AccessTab = "roles" | "users";
type Trend = "up" | "down";

type Kpi = {
  label: string;
  value: string;
  delta: string;
  trend: Trend;
};

type RoleModel = {
  id: string;
  name: string;
  color: string;
  description: string;
  members: string[];
  dashboards: string[];
  permissions: Record<PermissionKey, boolean>;
};

type PermissionKey = "view" | "edit" | "share" | "export" | "manage";

type Connector = {
  id: Exclude<ProviderKey, "all">;
  name: string;
  color: string;
  status: "live" | "config" | "off";
  abbreviation: string;
  description: string;
  signing: string;
};

const fallbackDashboards: Dashboard[] = [
  {
    id: "executive-overview",
    title: "Executive Overview",
    description: "Performa bisnis tingkat atas: revenue, retensi, dan pertumbuhan.",
    provider: "tableau",
    group: "Leadership",
    tags: ["revenue", "growth", "kpi"],
    roles: ["admin", "executive", "analyst"],
    embed_url: "https://public.tableau.com/views/Superstore_24/Overview",
  },
  {
    id: "sales-performance",
    title: "Sales Performance",
    description: "Pipeline, teritori, dan pencapaian kuota tim penjualan.",
    provider: "tableau",
    group: "Sales",
    tags: ["sales", "pipeline", "quota"],
    roles: ["admin", "sales"],
    embed_url: "https://public.tableau.com/views/Superstore_24/Performance",
  },
  {
    id: "marketing-funnel",
    title: "Marketing Funnel",
    description: "Akuisisi, konversi, dan biaya per kanal pemasaran.",
    provider: "metabase",
    group: "Marketing",
    tags: ["mql", "cac", "conversion"],
    roles: ["admin", "analyst"],
    embed_url: "https://example.com/metabase/dashboard/marketing-funnel",
  },
  {
    id: "ops-throughput",
    title: "Operations Throughput",
    description: "Volume produksi, utilisasi, dan downtime pabrik.",
    provider: "powerbi",
    group: "Operations",
    tags: ["produksi", "utilisasi", "downtime"],
    roles: ["admin", "analyst"],
    embed_url: "https://example.com/powerbi/report/ops-throughput",
  },
  {
    id: "finance-summary",
    title: "Financial Summary",
    description: "Arus kas, margin, dan ringkasan P&L bulanan.",
    provider: "powerbi",
    group: "Finance",
    tags: ["cashflow", "margin", "p&l"],
    roles: ["admin", "executive"],
    embed_url: "https://example.com/powerbi/report/finance-summary",
  },
  {
    id: "agtech-yield",
    title: "Agtech Yield Insights",
    description: "Prediksi hasil panen dan efektivitas pupuk per wilayah.",
    provider: "superset",
    group: "Agtech & DS",
    tags: ["yield", "forecast", "wilayah"],
    roles: ["admin", "analyst"],
    embed_url: "https://example.com/superset/dashboard/agtech-yield",
  },
];

const fallbackProviders: ProviderInfo[] = [
  { key: "tableau", name: "Tableau", status: "alpha", supports_token_signing: true },
  { key: "metabase", name: "Metabase", status: "planned", supports_token_signing: true },
  { key: "powerbi", name: "Power BI", status: "planned", supports_token_signing: true },
  { key: "superset", name: "Apache Superset", status: "planned", supports_token_signing: true },
];

const providerLabels: Record<ProviderKey, string> = {
  all: "Semua",
  tableau: "Tableau",
  metabase: "Metabase",
  powerbi: "Power BI",
  superset: "Superset",
};

const providerTokens: Record<string, string> = {
  tableau: "Connected Apps signed token",
  metabase: "signed JWT",
  powerbi: "AAD embed token",
  superset: "guest token",
};

const providerFilters: ProviderKey[] = ["all", "tableau", "metabase", "powerbi", "superset"];

const kpiCatalog: Record<string, Kpi[]> = {
  "executive-overview": [
    { label: "Revenue YTD", value: "Rp 4,2 M", delta: "+12,4%", trend: "up" },
    { label: "Net retention", value: "118%", delta: "+3,1%", trend: "up" },
    { label: "Active accounts", value: "1.284", delta: "+86", trend: "up" },
    { label: "Churn", value: "2,1%", delta: "-0,4%", trend: "up" },
  ],
  "sales-performance": [
    { label: "Pipeline", value: "Rp 9,8 M", delta: "+22%", trend: "up" },
    { label: "Win rate", value: "34%", delta: "+2,8%", trend: "up" },
    { label: "Avg deal", value: "Rp 64 jt", delta: "-3%", trend: "down" },
    { label: "Quota att.", value: "91%", delta: "+7%", trend: "up" },
  ],
  "marketing-funnel": [
    { label: "Leads", value: "18.402", delta: "+9%", trend: "up" },
    { label: "MQL to SQL", value: "27%", delta: "+1,9%", trend: "up" },
    { label: "CAC", value: "Rp 312 rb", delta: "-6%", trend: "up" },
    { label: "ROAS", value: "4,1x", delta: "+0,3", trend: "up" },
  ],
  "ops-throughput": [
    { label: "Output/hari", value: "8.940 t", delta: "+4%", trend: "up" },
    { label: "Utilisasi", value: "87%", delta: "+2%", trend: "up" },
    { label: "Downtime", value: "3,2%", delta: "+0,5%", trend: "down" },
    { label: "OEE", value: "79%", delta: "-1%", trend: "down" },
  ],
  "finance-summary": [
    { label: "Gross margin", value: "41,3%", delta: "+1,2%", trend: "up" },
    { label: "EBITDA", value: "Rp 1,9 M", delta: "+8%", trend: "up" },
    { label: "Cash", value: "Rp 6,4 M", delta: "+0,9 M", trend: "up" },
    { label: "AR days", value: "42", delta: "-3", trend: "up" },
  ],
  "agtech-yield": [
    { label: "Avg yield", value: "6,8 t/ha", delta: "+0,4", trend: "up" },
    { label: "Forecast acc.", value: "92%", delta: "+3%", trend: "up" },
    { label: "Wilayah", value: "34", delta: "+2", trend: "up" },
    { label: "Adopsi", value: "68%", delta: "+11%", trend: "up" },
  ],
};

const initialRoles: RoleModel[] = [
  {
    id: "admin",
    name: "Admin",
    color: "#1b3a6b",
    description: "Akses penuh ke seluruh sistem, connector, dan konfigurasi.",
    members: ["FB", "AS", "RH"],
    dashboards: fallbackDashboards.map((dashboard) => dashboard.id),
    permissions: { view: true, edit: true, share: true, export: true, manage: true },
  },
  {
    id: "executive",
    name: "Executive",
    color: "#0f5249",
    description: "Melihat dashboard strategis untuk pengambilan keputusan.",
    members: ["DW", "YP"],
    dashboards: ["executive-overview", "finance-summary"],
    permissions: { view: true, edit: false, share: true, export: true, manage: false },
  },
  {
    id: "sales",
    name: "Sales",
    color: "#c08a1e",
    description: "Akses ke dashboard penjualan, pipeline, dan kuota.",
    members: ["NK", "RA", "TS", "ML"],
    dashboards: ["sales-performance"],
    permissions: { view: true, edit: false, share: false, export: true, manage: false },
  },
  {
    id: "analyst",
    name: "Data Analyst",
    color: "#9a5bc4",
    description: "Membangun, mengedit, dan membagikan dashboard analitik.",
    members: ["FB", "IW"],
    dashboards: ["marketing-funnel", "ops-throughput", "agtech-yield"],
    permissions: { view: true, edit: true, share: true, export: true, manage: false },
  },
  {
    id: "viewer",
    name: "Viewer",
    color: "#6b6d65",
    description: "Hanya melihat dashboard yang sudah dibagikan.",
    members: ["GH", "PL", "QW", "ER", "TY"],
    dashboards: ["executive-overview"],
    permissions: { view: true, edit: false, share: false, export: false, manage: false },
  },
];

const permissionLabels: Record<PermissionKey, [string, string]> = {
  view: ["Lihat dashboard", "Membuka dan menjelajah dashboard"],
  edit: ["Edit dashboard", "Mengubah konfigurasi dan layout"],
  share: ["Bagikan", "Membagikan tautan embed"],
  export: ["Ekspor data", "Unduh CSV atau gambar"],
  manage: ["Kelola sistem", "Atur connector, peran, dan pengguna"],
};

const users = [
  ["FB", "Fajar Baim", "fajar.baim@pupuk-indonesia.co.id", "Admin", "Baru saja", "active"],
  ["DW", "Dewi Wulandari", "dewi.w@pupuk-indonesia.co.id", "Executive", "2 jam lalu", "active"],
  ["NK", "Nanda Kusuma", "nanda.k@pupuk-indonesia.co.id", "Sales", "Kemarin", "idle"],
  ["IW", "Indra Wijaya", "indra.w@pupuk-indonesia.co.id", "Data Analyst", "5 menit lalu", "active"],
  ["GH", "Gita Hapsari", "gita.h@pupuk-indonesia.co.id", "Viewer", "3 hari lalu", "idle"],
];

const connectors: Connector[] = [
  {
    id: "tableau",
    name: "Tableau",
    color: "#1f6bb8",
    status: "live",
    abbreviation: "Tb",
    description: "Connected Apps untuk embedding dashboard terautentikasi.",
    signing: "Connected Apps",
  },
  {
    id: "powerbi",
    name: "Power BI",
    color: "#c08a1e",
    status: "config",
    abbreviation: "Pb",
    description: "Embed reports dengan Azure AD dan workspace token.",
    signing: "AAD token",
  },
  {
    id: "metabase",
    name: "Metabase",
    color: "#2d9d78",
    status: "off",
    abbreviation: "Mb",
    description: "Signed JWT untuk dashboard publik yang dibatasi portal.",
    signing: "signed JWT",
  },
  {
    id: "superset",
    name: "Apache Superset",
    color: "#9a5bc4",
    status: "off",
    abbreviation: "Sp",
    description: "Guest token embedding untuk chart dan dashboard Superset.",
    signing: "guest token",
  },
];

const palettes: Array<[Palette, string, string, string]> = [
  ["navy", "#1b3a6b", "Navy", "Stabilitas & kepercayaan"],
  ["forest", "#0f5249", "Forest", "Pertumbuhan & keseimbangan"],
  ["slate", "#334155", "Slate", "Netral & otoritatif"],
  ["indigo", "#3b3aa8", "Indigo", "Fokus & kecerdasan"],
];

function normalizeProvider(provider: string): ProviderKey {
  return providerLabels[provider as ProviderKey] ? (provider as ProviderKey) : "tableau";
}

function DashboardThumb({ provider, seed }: { provider: string; seed: number }) {
  const colors: Record<string, [string, string]> = {
    tableau: ["#1f6bb8", "#4a93d6"],
    metabase: ["#2d9d78", "#5cc4a0"],
    powerbi: ["#c08a1e", "#e0b04a"],
    superset: ["#9a5bc4", "#bd8fe0"],
  };
  const [primary, secondary] = colors[provider] ?? colors.tableau;
  const points = Array.from({ length: 7 }, (_, index) => {
    const x = 25 + index * 26;
    const y = 40 + ((seed * 5 + index * 17) % 38);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg aria-hidden="true" className="thumb-chart" viewBox="0 0 200 132" preserveAspectRatio="none">
      <rect width="200" height="132" fill={primary} opacity="0.05" />
      {Array.from({ length: 7 }, (_, index) => {
        const height = 22 + ((seed * 7 + index * index * 13) % 70);
        return (
          <rect
            fill={index % 2 ? secondary : primary}
            height={height}
            key={index}
            opacity={0.55 + 0.05 * (index % 3)}
            rx="3"
            width="15"
            x={18 + index * 26}
            y={132 - height - 14}
          />
        );
      })}
      <polyline
        fill="none"
        opacity="0.9"
        points={points}
        stroke={primary}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function LineChart() {
  const points = Array.from({ length: 12 }, (_, index) => [
    40 + index * 54,
    200 - (40 + ((index * index * 9 + index * 37) % 150)),
  ]);
  const path = points.map(([x, y], index) => `${index ? "L" : "M"}${x},${y}`).join(" ");
  const area = `M40,210 ${points.map(([x, y]) => `L${x},${y}`).join(" ")} L${
    points[points.length - 1][0]
  },210 Z`;

  return (
    <svg aria-label="Tren 12 bulan" className="chart" viewBox="0 0 700 230" preserveAspectRatio="none">
      {[0, 1, 2, 3, 4].map((line) => (
        <line key={line} stroke="var(--border)" x1="40" x2="688" y1={30 + line * 40} y2={30 + line * 40} />
      ))}
      <path d={area} fill="var(--brand)" opacity="0.08" />
      <path d={path} fill="none" stroke="var(--brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      {points
        .filter((_, index) => index % 3 === 0)
        .map(([x, y]) => (
          <circle cx={x} cy={y} fill="var(--surface)" key={`${x}-${y}`} r="3.5" stroke="var(--brand)" strokeWidth="2" />
        ))}
    </svg>
  );
}

function DonutChart() {
  const segments: Array<[number, string]> = [
    [40, "var(--brand)"],
    [27, "var(--accent)"],
    [20, "#1f6bb8"],
    [13, "#2d9d78"],
  ];
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg aria-label="Distribusi segmen" className="donut" viewBox="0 0 200 200">
      {segments.map(([value, color]) => {
        const length = (circumference * value) / 100;
        const segment = (
          <circle
            cx="100"
            cy="100"
            fill="none"
            key={color}
            r={radius}
            stroke={color}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            strokeWidth="22"
            transform="rotate(-90 100 100)"
          />
        );
        offset += length;
        return segment;
      })}
      <text className="donut-value" textAnchor="middle" x="100" y="96">
        40%
      </text>
      <text className="donut-label" textAnchor="middle" x="100" y="118">
        kanal utama
      </text>
    </svg>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboards, setDashboards] = useState<Dashboard[]>(fallbackDashboards);
  const [providers, setProviders] = useState<ProviderInfo[]>(fallbackProviders);
  const [activeDashboardId, setActiveDashboardId] = useState(fallbackDashboards[0].id);
  const [activeEmbed, setActiveEmbed] = useState<DashboardEmbed | null>(null);
  const [view, setView] = useState<View>("dashboards");
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<ProviderKey>("all");
  const [theme, setTheme] = useState<Theme>("light");
  const [palette, setPalette] = useState<Palette>("navy");
  const [status, setStatus] = useState<"ready" | "loading" | "offline">("loading");
  const [accessTab, setAccessTab] = useState<AccessTab>("roles");
  const [roles, setRoles] = useState<RoleModel[]>(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState("admin");
  const [selectedConnectorId, setSelectedConnectorId] = useState<Connector["id"] | null>(null);
  const [authStrategy, setAuthStrategy] = useState("jwt");
  const [testState, setTestState] = useState<"idle" | "testing" | "done">("idle");

  const activeDashboard = useMemo(
    () => dashboards.find((dashboard) => dashboard.id === activeDashboardId) ?? dashboards[0],
    [activeDashboardId, dashboards],
  );

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? roles[0],
    [roles, selectedRoleId],
  );

  const filteredDashboards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return dashboards.filter((dashboard) => {
      const dashboardProvider = normalizeProvider(dashboard.provider);
      const matchesProvider = provider === "all" || dashboardProvider === provider;
      const searchable = [
        dashboard.title,
        dashboard.description,
        dashboard.provider,
        dashboard.group,
        ...dashboard.tags,
      ]
        .join(" ")
        .toLowerCase();

      return matchesProvider && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [dashboards, provider, query]);

  async function loadData() {
    setStatus("loading");
    try {
      const [nextDashboards, nextProviders] = await Promise.all([fetchDashboards(), fetchProviders()]);
      const usableDashboards = nextDashboards.length ? nextDashboards : fallbackDashboards;

      setDashboards(usableDashboards);
      setProviders(nextProviders.length ? nextProviders : fallbackProviders);
      setActiveDashboardId((current) =>
        usableDashboards.some((dashboard) => dashboard.id === current)
          ? current
          : (usableDashboards[0]?.id ?? current),
      );
      setStatus("ready");
    } catch {
      setDashboards(fallbackDashboards);
      setProviders(fallbackProviders);
      setStatus("offline");
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !activeDashboard) {
      return;
    }

    fetchDashboardEmbed(activeDashboard.id)
      .then(setActiveEmbed)
      .catch(() => {
        setActiveEmbed({
          dashboard_id: activeDashboard.id,
          embed_type: "iframe",
          embed_url: activeDashboard.embed_url,
          options: {},
          provider: activeDashboard.provider,
          token: null,
        });
      });
  }, [activeDashboard, isAuthenticated]);

  useEffect(() => {
    setTestState("idle");
  }, [selectedConnectorId]);

  const dashboardCount = dashboards.length;
  const providerCount = new Set(providers.map((item) => item.key)).size || 4;
  const roleCount = new Set(dashboards.flatMap((dashboard) => dashboard.roles)).size || roles.length;

  function openViewer(dashboardId: string) {
    setActiveDashboardId(dashboardId);
    setView("viewer");
  }

  function toggleRolePermission(permission: PermissionKey) {
    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRoleId
          ? {
              ...role,
              permissions: { ...role.permissions, [permission]: !role.permissions[permission] },
            }
          : role,
      ),
    );
  }

  function toggleRoleDashboard(dashboardId: string) {
    setRoles((current) =>
      current.map((role) => {
        if (role.id !== selectedRoleId) {
          return role;
        }

        const hasDashboard = role.dashboards.includes(dashboardId);
        return {
          ...role,
          dashboards: hasDashboard
            ? role.dashboards.filter((id) => id !== dashboardId)
            : [...role.dashboards, dashboardId],
        };
      }),
    );
  }

  function testConnector() {
    setTestState("testing");
    window.setTimeout(() => setTestState("done"), 900);
  }

  if (!isAuthenticated) {
    return (
      <main className={`login-screen app--${theme} palette-${palette}`}>
        <aside className="login-aside">
          <div className="wordmark">
            <span className="logo-mark">
              <BarChart3 size={20} aria-hidden="true" />
            </span>
            <span className="brand-name">Vizzor</span>
          </div>
          <div className="login-copy">
            <h1>Semua dashboard, satu portal.</h1>
            <p>
              Satukan Tableau, Power BI, Metabase, dan Superset dengan branding konsisten dan akses
              berbasis peran.
            </p>
          </div>
          <div className="login-foot">
            <span>Self-hosted</span>
            <span>Web-based</span>
            <span>Open source</span>
          </div>
        </aside>
        <section className="login-main">
          <form
            className="login-card"
            onSubmit={(event) => {
              event.preventDefault();
              setIsAuthenticated(true);
            }}
          >
            <p className="eyebrow">Vizzor Cloud</p>
            <h2>Masuk ke ruang kerja</h2>
            <p className="muted">Gunakan akun Vizzor untuk melanjutkan.</p>
            <label className="field">
              <span>Email</span>
              <input autoComplete="email" type="email" defaultValue="admin@vizzor.local" />
            </label>
            <label className="field">
              <span>Kata sandi</span>
              <input autoComplete="current-password" type="password" defaultValue="vizzor" />
            </label>
            <button className="primary-button" type="submit">
              Masuk
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <p className="demo-hint">
              Demo prototype. Kredensial sudah terisi, klik Masuk untuk membuka cockpit.
            </p>
          </form>
        </section>
      </main>
    );
  }

  const title =
    view === "viewer" ? activeDashboard?.title : view === "access" ? "Akses & peran" : view === "connectors" ? "Connectors" : view === "settings" ? "Pengaturan" : "Dashboards";
  const eyebrow =
    view === "viewer" ? "Dashboard" : view === "access" ? "Kontrol akses" : view === "connectors" ? "Integrasi" : view === "settings" ? "Konfigurasi" : "Self-hosted BI cockpit";

  return (
    <main className={`app app--${theme} palette-${palette}`}>
      <aside className="sidebar">
        <div className="side-brand">
          <span className="logo-mark">
            <BarChart3 size={18} aria-hidden="true" />
          </span>
          <span className="brand-name">Vizzor</span>
          <span className="alpha-badge">Alpha</span>
        </div>

        <nav className="side-nav" aria-label="Primary">
          <span className="nav-label">Ruang kerja</span>
          <button className={view === "dashboards" || view === "viewer" ? "nav-item active" : "nav-item"} type="button" onClick={() => setView("dashboards")}>
            <LayoutDashboard size={18} aria-hidden="true" />
            Dashboards
          </button>
          <button className={view === "access" ? "nav-item active" : "nav-item"} type="button" onClick={() => setView("access")}>
            <Users size={18} aria-hidden="true" />
            Akses & peran
          </button>
          <button className={view === "connectors" ? "nav-item active" : "nav-item"} type="button" onClick={() => setView("connectors")}>
            <DatabaseZap size={18} aria-hidden="true" />
            Connectors
          </button>
          <span className="nav-label nav-label-spaced">Sistem</span>
          <button className={view === "settings" ? "nav-item active" : "nav-item"} type="button" onClick={() => setView("settings")}>
            <Settings size={18} aria-hidden="true" />
            Pengaturan
          </button>
        </nav>

        <div className="side-foot">
          <span className="avatar">FB</span>
          <span className="who">
            <strong>Fajar Baim</strong>
            <small>Admin · Pupuk Indonesia</small>
          </span>
          <button className="icon-button small" type="button" aria-label="Keluar" title="Keluar" onClick={() => setIsAuthenticated(false)}>
            <LogOut size={15} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="title-row">
            {view === "viewer" ? (
              <button className="back-button" type="button" onClick={() => setView("dashboards")}>
                <ArrowLeft size={16} aria-hidden="true" />
                Katalog
              </button>
            ) : null}
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h2>{title}</h2>
            </div>
          </div>

          <div className="topbar-actions">
            {view === "dashboards" ? (
              <label className="search-field top-search">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Cari dashboard, tag, provider..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            ) : null}
            <button className="icon-button" type="button" title="Segarkan" aria-label="Segarkan" onClick={() => void loadData()}>
              <RefreshCw size={18} aria-hidden="true" />
            </button>
            <button
              className="icon-button"
              type="button"
              title="Ganti tema"
              aria-label="Ganti tema"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            </button>
          </div>
        </header>

        {view === "dashboards" ? (
          <section className="content">
            <div className="metrics">
              <Metric icon={<LayoutDashboard size={16} />} label="Dashboards" value={dashboardCount} note={status === "offline" ? "fallback aktif" : ""} />
              <Metric icon={<DatabaseZap size={16} />} label="Providers" value={providerCount} note="+1 segera" />
              <Metric icon={<ShieldCheck size={16} />} label="Peran" value={roleCount} note="RBAC aktif" />
              <Metric icon={<Check size={16} />} label="Status" value={status} note="" />
            </div>

            <div className="section-head">
              <div>
                <h3>Katalog</h3>
                <p>{filteredDashboards.length} dari {dashboards.length} dashboard</p>
              </div>
              <div className="filters" aria-label="Provider filter">
                {providerFilters.map((item) => (
                  <button className={provider === item ? "chip active" : "chip"} key={item} type="button" onClick={() => setProvider(item)}>
                    {providerLabels[item]}
                  </button>
                ))}
              </div>
            </div>

            <div className="dashboard-grid">
              {filteredDashboards.map((dashboard, index) => (
                <button className="dashboard-card" key={dashboard.id} type="button" onClick={() => openViewer(dashboard.id)}>
                  <div className="card-thumb">
                    <DashboardThumb provider={normalizeProvider(dashboard.provider)} seed={index + 2} />
                  </div>
                  <div className="card-body">
                    <span className="group-label">{dashboard.group}</span>
                    <h4>{dashboard.title}</h4>
                    <p>{dashboard.description}</p>
                    <div className="card-meta">
                      <span className={`provider-pill ${normalizeProvider(dashboard.provider)}`}>{providerLabels[normalizeProvider(dashboard.provider)]}</span>
                      <span className="role-count">
                        <Users size={13} aria-hidden="true" />
                        {dashboard.roles.length} peran
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {view === "viewer" && activeDashboard ? (
          <section className="content">
            <div className="embed-note">
              <LayoutDashboard size={17} aria-hidden="true" />
              <span>Dirender via connector {providerLabels[normalizeProvider(activeDashboard.provider)]}</span>
              <code>token: {providerTokens[activeDashboard.provider] ?? "signed token"}</code>
            </div>
            <div className="dash-kpis">
              {(kpiCatalog[activeDashboard.id] ?? kpiCatalog["executive-overview"]).map((kpi) => (
                <div className="kpi" key={kpi.label}>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small className={kpi.trend}>{kpi.delta}</small>
                </div>
              ))}
            </div>
            <div className="dash-row">
              <article className="panel">
                <h3>Tren 12 bulan</h3>
                <p>Performa bulanan · {activeDashboard.group}</p>
                <LineChart />
              </article>
              <article className="panel">
                <h3>Distribusi</h3>
                <p>Kontribusi per segmen</p>
                <DonutChart />
              </article>
            </div>
            <article className="embed-preview">
              <div>
                <h3>{activeDashboard.title}</h3>
                <p>{activeDashboard.description}</p>
              </div>
              {activeEmbed?.embed_url ? (
                <iframe title={activeDashboard.title} src={activeEmbed.embed_url} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              ) : (
                <div className="embed-empty">Embed dashboard sedang disiapkan</div>
              )}
            </article>
          </section>
        ) : null}

        {view === "access" ? (
          <section className="content">
            <div className="tabs">
              <button className={accessTab === "roles" ? "tab active" : "tab"} type="button" onClick={() => setAccessTab("roles")}>
                Peran
              </button>
              <button className={accessTab === "users" ? "tab active" : "tab"} type="button" onClick={() => setAccessTab("users")}>
                Pengguna
              </button>
            </div>
            {accessTab === "users" ? (
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Pengguna</th>
                      <th>Peran</th>
                      <th>Aktivitas terakhir</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(([initial, name, email, role, lastActive, userStatus]) => (
                      <tr key={email}>
                        <td>
                          <span className="user-cell">
                            <span className="avatar">{initial}</span>
                            <span>
                              <strong>{name}</strong>
                              <small>{email}</small>
                            </span>
                          </span>
                        </td>
                        <td>
                          <span className="soft-badge">{role}</span>
                        </td>
                        <td>{lastActive}</td>
                        <td>
                          <span className={`status-dot ${userStatus}`}>{userStatus === "active" ? "Aktif" : "Idle"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="access-layout">
                <div className="role-list">
                  {roles.map((role) => (
                    <button className={role.id === selectedRoleId ? "role-row active" : "role-row"} key={role.id} type="button" onClick={() => setSelectedRoleId(role.id)}>
                      <span className="role-dot" style={{ background: role.color }} />
                      <span>
                        <strong>{role.name}</strong>
                        <small>{role.members.length} anggota</small>
                      </span>
                      <em>{role.dashboards.length} dash</em>
                    </button>
                  ))}
                </div>
                <div className="role-detail">
                  <div className="detail-head">
                    <span className="role-badge" style={{ background: selectedRole.color }}>
                      {selectedRole.name[0]}
                    </span>
                    <span>
                      <h3>{selectedRole.name}</h3>
                      <p>{selectedRole.description}</p>
                    </span>
                  </div>

                  <p className="block-label">Anggota ({selectedRole.members.length})</p>
                  <div className="member-stack">
                    {selectedRole.members.map((member) => (
                      <span className="avatar" key={member}>{member}</span>
                    ))}
                  </div>

                  <p className="block-label">Izin</p>
                  <div className="permission-list">
                    {(Object.keys(permissionLabels) as PermissionKey[]).map((permission) => (
                      <div className="permission-row" key={permission}>
                        <span>
                          <strong>{permissionLabels[permission][0]}</strong>
                          <small>{permissionLabels[permission][1]}</small>
                        </span>
                        <button
                          aria-pressed={selectedRole.permissions[permission]}
                          className={selectedRole.permissions[permission] ? "switch on" : "switch"}
                          type="button"
                          onClick={() => toggleRolePermission(permission)}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="block-label">Dashboard yang terlihat</p>
                  <div className="access-pills">
                    {dashboards.map((dashboard) => {
                      const isVisible = selectedRole.dashboards.includes(dashboard.id);
                      return (
                        <button className={isVisible ? "access-pill on" : "access-pill"} key={dashboard.id} type="button" onClick={() => toggleRoleDashboard(dashboard.id)}>
                          <span className="check-box">{isVisible ? <Check size={11} aria-hidden="true" /> : null}</span>
                          {dashboard.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : null}

        {view === "connectors" ? (
          <section className="content">
            {selectedConnectorId ? (
              <ConnectorDetail connector={connectors.find((item) => item.id === selectedConnectorId) ?? connectors[0]} testState={testState} onBack={() => setSelectedConnectorId(null)} onTest={testConnector} />
            ) : (
              <div className="connector-grid">
                {connectors.map((connector) => (
                  <button className="connector-card" key={connector.id} type="button" onClick={() => setSelectedConnectorId(connector.id)}>
                    <span className="connector-logo" style={{ background: connector.color }}>
                      {connector.abbreviation}
                    </span>
                    <span>
                      <strong>{connector.name}</strong>
                      <small>{connector.signing}</small>
                    </span>
                    <em className={`connector-status ${connector.status}`}>
                      {connector.status === "live" ? "Aktif" : connector.status === "config" ? "Perlu konfigurasi" : "Tersedia"}
                    </em>
                    <p>{connector.description}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {view === "settings" ? (
          <section className="content settings-stack">
            <article className="settings-panel">
              <h3>Tampilan</h3>
              <p>Atur tema dan warna brand portal.</p>
              <div className="settings-row">
                <span>
                  <strong>Mode gelap</strong>
                  <small>Beralih antara terang dan gelap</small>
                </span>
                <button className={theme === "dark" ? "switch on" : "switch"} type="button" onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))} />
              </div>
              <p className="block-label">Warna brand</p>
              <div className="swatches">
                {palettes.map(([id, color, name, description]) => (
                  <button className={palette === id ? "swatch active" : "swatch"} key={id} type="button" onClick={() => setPalette(id)}>
                    <span style={{ background: color }} />
                    <strong>{name}</strong>
                    <small>{description}</small>
                  </button>
                ))}
              </div>
            </article>

            <article className="settings-panel">
              <h3>Autentikasi</h3>
              <p>Strategi login yang dipakai portal.</p>
              <div className="settings-row">
                <span>
                  <strong>Strategi</strong>
                  <small>JWT untuk alpha, OAuth/OIDC untuk produksi</small>
                </span>
                <div className="segmented">
                  {["jwt", "oauth", "oidc"].map((strategy) => (
                    <button className={authStrategy === strategy ? "active" : ""} key={strategy} type="button" onClick={() => setAuthStrategy(strategy)}>
                      {strategy.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-row">
                <span>
                  <strong>Masa berlaku token</strong>
                  <small>Durasi sesi sebelum login ulang</small>
                </span>
                <button className="select-button" type="button">
                  60 menit
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
              </div>
            </article>

            <article className="settings-panel">
              <h3>Ruang kerja</h3>
              <p>Identitas instance Vizzor ini.</p>
              <div className="settings-row">
                <span>
                  <strong>Nama</strong>
                  <small>Tampil di sidebar dan judul</small>
                </span>
                <input className="text-input" defaultValue="Pupuk Indonesia BI" />
              </div>
              <div className="settings-row">
                <span>
                  <strong>Environment</strong>
                  <small>Mode operasi saat ini</small>
                </span>
                <span className="soft-badge">development</span>
              </div>
            </article>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ icon, label, note, value }: { icon: ReactNode; label: string; note: string; value: number | string }) {
  return (
    <div className="metric">
      <span>
        {icon}
        {label}
      </span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function ConnectorDetail({
  connector,
  onBack,
  onTest,
  testState,
}: {
  connector: Connector;
  onBack: () => void;
  onTest: () => void;
  testState: "idle" | "testing" | "done";
}) {
  const fields =
    connector.id === "tableau"
      ? [
          ["Site URL", "https://tableau.pupuk-indonesia.co.id", "text"],
          ["Site content URL", "pupuk-bi", "text"],
          ["Connected App Client ID", "cap_8f2a91c4e7", "text"],
          ["Secret ID", "sec_id_4b21", "text"],
          ["Secret value", "••••••••••••••••", "password"],
          ["API version", "3.21", "text"],
        ]
      : connector.id === "powerbi"
        ? [
            ["Tenant ID", "", "text"],
            ["Client ID", "", "text"],
            ["Client secret", "", "password"],
            ["Workspace ID", "", "text"],
          ]
        : [
            ["Base URL", "", "text"],
            ["Embedding secret", "", "password"],
          ];

  return (
    <article className="connector-detail">
      <button className="back-button inline" type="button" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        Semua connector
      </button>
      <div className="form-panel">
        <div className="detail-head">
          <span className="connector-logo large" style={{ background: connector.color }}>
            {connector.abbreviation}
          </span>
          <span>
            <h3>{connector.name}</h3>
            <p>{connector.description}</p>
          </span>
          <button className={connector.status === "live" ? "switch on" : "switch"} type="button" />
        </div>
        <p className="block-label">Konfigurasi</p>
        <div className="form-grid">
          {fields.map(([label, value, type]) => (
            <label className="field" key={label}>
              <span>{label}</span>
              <input defaultValue={value} placeholder={label} type={type} />
            </label>
          ))}
        </div>
        <div className="form-actions">
          <button className="ghost-button" disabled={testState === "testing"} type="button" onClick={onTest}>
            {testState === "testing" ? "Menguji..." : "Uji koneksi"}
          </button>
          <button className="ghost-button strong" type="button">
            Simpan
          </button>
          {testState === "done" ? (
            <span className="test-result">
              <Check size={16} aria-hidden="true" />
              Koneksi berhasil · token signing OK
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default App;
