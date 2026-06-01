# Security Policy

Vizzor handles authentication, dashboard visibility, and BI provider credentials, so security issues matter.

## Supported Versions

Vizzor is currently in alpha. Security fixes target the `main` branch until versioned releases begin.

## Reporting a Vulnerability

Please do not disclose sensitive vulnerabilities in public issues.

Until a dedicated security email is published, create a minimal GitHub issue saying that you need a private security contact, without exploit details, secrets, logs, or credentials.

## Sensitive Data

Never commit:

- `.env` files with real values
- private keys or provider secrets
- Tableau Connected App secret values
- OAuth or OIDC client secrets
- exported dashboard data containing private customer information

