from pydantic import BaseModel


class ProviderInfo(BaseModel):
    key: str
    name: str
    status: str
    supports_token_signing: bool

