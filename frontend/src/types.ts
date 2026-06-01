export type Dashboard = {
  id: string;
  title: string;
  description: string;
  provider: string;
  group: string;
  tags: string[];
  roles: string[];
  embed_url: string;
};

export type DashboardEmbed = {
  dashboard_id: string;
  provider: string;
  embed_type: string;
  embed_url: string;
  token: string | null;
  options: Record<string, string | boolean | number>;
};

export type ProviderInfo = {
  key: string;
  name: string;
  status: string;
  supports_token_signing: boolean;
};

