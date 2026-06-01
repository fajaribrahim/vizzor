import type { Dashboard, DashboardEmbed, ProviderInfo } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchDashboards() {
  return request<Dashboard[]>("/dashboards");
}

export function fetchProviders() {
  return request<ProviderInfo[]>("/providers");
}

export function fetchDashboardEmbed(dashboardId: string) {
  return request<DashboardEmbed>(`/dashboards/${dashboardId}/embed`);
}

