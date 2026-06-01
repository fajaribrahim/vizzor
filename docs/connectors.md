# Connectors

Connectors make BI providers look consistent to the rest of Vizzor.

Each connector should provide:

- provider metadata
- dashboard embed payload generation
- token signing when the provider requires it
- clear error messages for invalid configuration

## Current Connector

`tableau` is the first alpha connector. The current implementation returns iframe-compatible embed payloads and is ready for Connected Apps token signing to be added.

## Planned Connectors

- Power BI
- Metabase
- Apache Superset

## Interface

Backend connectors implement `BIConnector` in `backend/app/services/connectors/base.py`.

```python
class BIConnector(ABC):
    key: str
    name: str
    supports_token_signing: bool

    def provider_info(self) -> ProviderInfo:
        ...

    def build_embed_payload(self, dashboard: Dashboard) -> DashboardEmbed:
        ...
```

