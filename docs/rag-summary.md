# Arsenale

> Auto-generated on 2026-03-08. High-level product overview for LLM RAG consumption.

## What is Arsenale

Arsenale is a self-hosted, open-source remote connection manager that provides a unified web interface to manage and connect to remote servers via SSH, RDP, and VNC. It combines browser-based terminal and desktop access with an encrypted credential vault, team collaboration, multi-tenant organizations, and infrastructure orchestration — all from a single deployment.

Think of it as a modern, web-based alternative to tools like mRemoteNG, RoyalTS, or Apache Guacamole — but designed from the ground up for teams that need secure credential management, granular sharing, and organizational structure around their remote access workflows.

## Who is it for

- **IT teams and Managed Service Providers (MSPs)** managing large fleets of servers across multiple clients or organizations. Arsenale's multi-tenant architecture lets a single deployment serve many isolated organizations, each with their own users, teams, connections, and security policies.
- **DevOps and infrastructure engineers** who want quick, browser-based SSH and RDP access without installing desktop clients or managing local credential files. Open a terminal or remote desktop in your browser, from anywhere.
- **Security-conscious organizations** that need credentials encrypted at rest with per-user master keys, not stored in plaintext config files or shared spreadsheets. Arsenale's vault model ensures that even database-level access does not expose credentials.
- **Teams that share infrastructure access** and need granular, auditable permission controls over who can view, use, or administer each connection and secret.

## Remote Access

### SSH Terminals
Arsenale provides full SSH terminal emulation directly in the browser, powered by XTerm.js. Users can open multiple SSH sessions as tabs in a workspace that persists across page reloads. Each terminal session supports configurable fonts, themes, cursor styles, scrollback buffers, and bell behavior. Sessions connect via Socket.IO WebSocket transport for low-latency bidirectional communication.

### Integrated SFTP
Every SSH session includes a built-in SFTP file browser. Users can navigate remote directories, create folders, rename and delete files, and upload or download files — all without leaving the terminal view. File transfers use chunked streaming (64KB chunks) with real-time progress tracking and cancellation support.

### RDP Remote Desktop
RDP sessions are rendered in the browser using the Guacamole protocol (via guacamole-common-js). Users get full remote desktop access with keyboard and mouse input, clipboard synchronization, and drive redirection for file sharing between local and remote machines. RDP settings are highly customizable: color depth, resolution, DPI, resize method, quality presets, wallpaper and font smoothing toggles, audio redirection, security mode, and keyboard layout.

### VNC Support
VNC connections are also supported for environments that use VNC-based remote desktop access.

### SSH Gateway Bastion Hosts
Connections can be routed through SSH gateway bastion hosts (jump servers) for secure access to machines in private networks. Gateways can be self-managed or deployed as managed container instances with automatic health monitoring and SSH key rotation.

## Encrypted Credential Vault

All connection credentials are encrypted at rest using AES-256-GCM with per-user master keys. Each user's master key is derived from their password using Argon2id (a memory-hard key derivation function), ensuring that even if the database is compromised, credentials remain protected without the user's password.

The vault auto-locks after configurable inactivity (default 30 minutes), requiring re-authentication. Users can unlock via password or — if MFA is configured — via TOTP, SMS OTP, or WebAuthn passkey, making re-unlock convenient without sacrificing security. A recovery key is generated at signup to ensure vault access is never permanently lost, even if the user forgets their password.

### Vault Secrets Manager (Keychain)
Beyond connection credentials, Arsenale includes a full secrets manager for storing arbitrary sensitive data: login credentials, SSH keys, TLS certificates, API keys, and secure notes. Secrets support versioning (view and restore previous versions), expiry dates with advance alert notifications, tagging, and folder-based organization.

## Team Collaboration and Sharing

### Connection Sharing
Connections can be shared with individual users at four granular permission levels: view (see the connection exists), use (connect to it), edit (modify its settings), and admin (full control including re-sharing). Sharing uses a re-encryption model — credentials are decrypted with the sharer's master key and re-encrypted with the recipient's master key, so no plaintext credentials are ever transmitted or stored in a shared state.

### Team Workspaces
Organizations can create teams with dedicated connection folders and a team-scoped vault. Team members share a team master key (encrypted per-member with each member's personal key), enabling seamless access to shared connections and secrets without individual share management. Teams support three roles: owner, admin, and member.

### Folder Organization
Connections are organized in a hierarchical folder tree with drag-and-drop reordering. Folders can be shared in bulk — sharing a folder shares all connections within it. Users can mark connections as favorites and access recent connections from a dedicated sidebar section.

### External Sharing
Vault secrets can be shared externally via time-limited, access-count-limited public links. External shares use token-derived encryption (HKDF) independent of the vault, with optional PIN protection (Argon2id-derived). Links can be revoked at any time.

## Multi-Tenant Organizations

Arsenale supports full multi-tenancy. An organization (tenant) provides an isolated environment with its own users, teams, connections, secrets, gateways, and audit logs. Tenant administrators can enforce organization-wide security policies:

- **Mandatory MFA**: require all members to set up multi-factor authentication
- **Vault timeout caps**: set a maximum auto-lock timeout that overrides individual user preferences
- **Default session timeouts**: configure how long SSH/RDP sessions can remain idle before being automatically closed
- **User management**: invite users, assign roles (owner, admin, member), create users directly, toggle accounts, and manage email/password changes with identity verification

Users can belong to multiple organizations and switch between them seamlessly via a tenant picker on login.

## Security

### Multi-Factor Authentication
Arsenale supports three MFA methods, all of which can be used for login, vault unlock, and identity verification:

- **TOTP**: time-based one-time passwords via authenticator apps (Google Authenticator, Authy, etc.)
- **SMS OTP**: one-time codes sent via SMS (supports Twilio, AWS SNS, and Vonage providers)
- **WebAuthn**: passkeys and hardware security keys (FIDO2/U2F) via the WebAuthn browser API

Organizations can enforce mandatory MFA for all members.

### Identity Verification
Sensitive operations (changing email, changing password, admin actions on other users) require a multi-step identity verification flow. The system automatically selects the best available method for the user (email OTP, TOTP, SMS, WebAuthn, or password) and creates a short-lived verification session.

### Account Protection
Accounts are automatically locked after repeated failed login attempts (configurable threshold and duration). Rate limiting is applied to authentication endpoints, SMS verification, and identity verification to prevent abuse.

### Audit Logging
Every security-relevant action is recorded in an immutable audit log with over 100 tracked action types spanning authentication, connections, vault operations, sharing, MFA, sessions, secrets, teams, gateways, and administration. Audit logs are filterable by action type, date range, IP address, and gateway, with full pagination. Tenant administrators can view organization-wide logs.

### Session Monitoring
Administrators have real-time visibility into all active SSH and RDP sessions across the organization. Sessions are tracked with idle detection, heartbeat monitoring, and automatic timeout enforcement. Sessions can be terminated remotely.

## Infrastructure Management

### SSH Gateways
Arsenale supports registering external SSH gateway bastion hosts for routing connections through jump servers. Gateway health is continuously monitored with automatic reconnection.

### Managed Gateway Instances
For containerized environments, Arsenale can deploy and manage gateway instances as containers (Docker, Podman, or Kubernetes). Managed gateways support auto-scaling rules (minimum/maximum replicas, sessions per instance, cooldown periods), real-time health monitoring via WebSocket, and container log viewing for troubleshooting.

### SSH Key Rotation
Gateway SSH key pairs are automatically rotated on a configurable schedule (default: daily at 2 AM) to minimize the window of exposure from compromised keys.

## User Experience

- **Modern UI**: responsive Material UI (MUI v6) interface with dark and light mode
- **Tabbed workspace**: open multiple SSH and RDP sessions simultaneously as browser tabs, with automatic state persistence and restoration across page reloads
- **Customizable terminals**: font family, size, line height, cursor style, theme colors, scrollback buffer, and bell behavior are all configurable per-user
- **Customizable RDP**: color depth, resolution, DPI, quality presets, audio settings, keyboard layout, and display options
- **Persistent preferences**: all UI layout state (panel visibility, sidebar sections, view modes) is automatically saved and restored per-user
- **Real-time notifications**: in-app notifications for sharing events, security alerts, secret expiry warnings, and system events, delivered in real-time via WebSocket
- **OAuth single sign-on**: log in with Google, Microsoft, GitHub, or any custom OIDC/SAML 2.0 provider. OAuth users set a vault password on first login.
- **Email verification**: configurable email verification for new accounts with support for SMTP, SendGrid, Amazon SES, Resend, and Mailgun providers
- **Pop-out sessions**: SSH and RDP sessions can be opened in independent browser windows for multi-monitor workflows

## How Arsenale Compares

Arsenale is often compared to Apache Guacamole, since both provide browser-based remote access. However, they target fundamentally different problem spaces. Guacamole is a clientless remote desktop gateway — its sole purpose is proxying RDP, VNC, SSH, and Telnet sessions through a browser. Arsenale is a Privileged Access Management (PAM) platform that uses guacd as its RDP/VNC rendering engine, but builds an entire security and governance layer on top that Guacamole does not provide.

### Arsenale vs Apache Guacamole

**Purpose and scope.** Guacamole is a remote desktop gateway: it connects users to machines and gets out of the way. It has no concept of a credential vault, no encrypted-at-rest secrets, and no sharing governance. Arsenale treats remote access as one function within a broader PAM platform — the core is secure credential management, organizational structure, and auditable sharing, with SSH/RDP/VNC sessions as the delivery mechanism.

**Technology stack.** Guacamole uses a Java webapp (Tomcat/Spring) with a C-based protocol proxy (guacd) and a vanilla JavaScript client. It is a mature, monolithic project. Arsenale is TypeScript end-to-end: React 19 + Vite + MUI + Zustand on the client, Express + Prisma + Socket.IO on the server. It uses guacamole-lite (a lightweight Node.js reimplementation) instead of the Java webapp, and guacamole-common-js for browser-side rendering. The result is a more cohesive, modern stack with a single language across the entire codebase.

**Credential security.** Guacamole stores connection credentials in plaintext in its database (or relies on the database's own access controls). Arsenale encrypts all credentials at rest with AES-256-GCM using per-user master keys derived via Argon2id. The vault auto-locks after configurable inactivity, and even database-level access does not expose secrets. This is the fundamental differentiator for any PAM use case.

**Supported protocols.** Guacamole supports RDP, VNC, SSH, Telnet, and Kubernetes exec, all handled natively by guacd. Arsenale currently supports SSH (directly via the Node.js server using ssh2 + Socket.IO, giving fine-grained session control), RDP (via guacd + guacamole-lite), and VNC (via guacd + guacamole-lite). SSH sessions are not proxied through guacd, which enables features like integrated SFTP, per-session recording in Asciicast format, and tighter session lifecycle management.

**Organization and sharing.** Guacamole offers connection groups (organizational and balancing) and user groups with permission assignments. The UI is functional but admin-oriented. Arsenale provides hierarchical folder trees with drag-and-drop, connection sharing at four granular permission levels (view, use, edit, admin) with credential re-encryption per recipient, team workspaces with shared vaults, favorites, and external secret sharing via time-limited links. The experience is designed to feel like a modern password manager (1Password, Bitwarden) applied to remote connections.

**Authentication.** Guacamole has an extensive ecosystem of authentication extensions: LDAP, SAML, CAS, OpenID Connect, RADIUS, Duo, TOTP, and database auth. This is its historical strength for heterogeneous enterprise environments. Arsenale supports JWT-based auth with automatic token refresh, three MFA methods (TOTP, SMS OTP, WebAuthn), and OAuth/SSO via Google, Microsoft, GitHub, custom OIDC, and SAML 2.0 providers. While the number of identity provider integrations is smaller than Guacamole's, the security model is deeper — with identity verification flows, account lockout, and rate limiting built in.

**Session recording.** Guacamole records sessions natively in its .guac format, convertible to video with guacenc. Arsenale also supports session recording: SSH sessions are captured in Asciicast v2 format (playable with a built-in terminal player), while RDP and VNC sessions are recorded in .guac format via guacd. Recordings are manageable through a dedicated UI with playback, listing, and deletion.

**Audit logging.** Guacamole provides basic connection history with timestamps and IP addresses. Arsenale has comprehensive audit logging with over 56 tracked action types covering authentication, vault operations, sharing, MFA events, session lifecycle, secrets management, team operations, gateway administration, and more. Logs are filterable by action type, date range, IP address, and target, with full pagination and tenant-wide visibility.

**Multi-tenancy.** Guacamole has no built-in multi-tenancy concept. Arsenale provides full tenant isolation — each organization has its own users, teams, connections, secrets, gateways, and audit logs. Tenant administrators can enforce security policies like mandatory MFA, vault timeout caps, and session idle timeouts.

**User experience.** Guacamole's interface is functional but visually dated, with limited customization options. Arsenale offers a modern Material UI interface with dark/light mode, tabbed workspaces for simultaneous sessions, pop-out windows for multi-monitor setups, customizable terminal and RDP settings, persistent UI preferences, and real-time notifications via WebSocket.

**Extensibility.** Guacamole is extensible via Java extension JARs — a traditional, powerful, but rigid model. Arsenale plans a sandboxed Lua plugin system (via fengari/wasmoon), webhook outbound integrations, and MCP server integration. The TypeScript/Node.js architecture is inherently more accessible to modern developers for customization and contribution.

### Summary comparison

| Aspect | Apache Guacamole | Arsenale |
|--------|-----------------|----------|
| Category | Remote desktop gateway | Privileged Access Manager |
| Stack | Java + C + vanilla JS | TypeScript end-to-end |
| Credential storage | Plaintext in database | AES-256-GCM vault + Argon2id key derivation |
| Protocols | RDP, VNC, SSH, Telnet, K8s | SSH (native), RDP, VNC (via guacd) |
| Auth modules | LDAP, SAML, OIDC, CAS, RADIUS, Duo, TOTP | JWT + TOTP + SMS OTP + WebAuthn + OAuth/SAML SSO |
| Session recording | Native (.guac → video) | Asciicast v2 (SSH) + .guac (RDP/VNC) |
| Audit logging | Basic connection history | 56+ action types, full filtering |
| Multi-tenancy | No | Full tenant isolation with policies |
| Sharing model | User/group permissions | 4-level sharing with credential re-encryption |
| UI | Functional, admin-oriented | Modern React + MUI, tabs, drag-and-drop |
| Plugin system | Java extensions | Lua sandboxed plugins (planned) |

The fundamental difference: Guacamole is the engine for remote access, while Arsenale is the platform that uses that engine as a component and adds the entire PAM layer — vault, organization, sharing, governance, and auditing — that Guacamole does not have and does not aim to provide.

## Deployment

Arsenale is designed to be easy to self-host:

- **Single command production deployment**: `docker compose up` launches the full stack — application server, web frontend (nginx), PostgreSQL database, and Guacamole daemon — as a multi-container stack with health checks and automatic dependency ordering.
- **Simple configuration**: a single `.env` file with sensible defaults. Only a handful of secrets need to be generated for production (JWT secret, encryption key, database password, Guacamole secret).
- **Automatic migrations**: the server runs database migrations on every startup — no manual schema management needed.
- **Container runtime flexibility**: supports both Docker and Podman with automatic detection. Works with Docker Compose v2 and Podman Compose.
- **Optional SSH gateway**: deploy the SSH gateway container for bastion-based access patterns, or register external gateway hosts.
- **Non-root containers**: all containers run as non-root users for improved security posture.
- **Volume persistence**: PostgreSQL data and RDP drive files are stored in named volumes for durability across container restarts.

## Technology

Arsenale is built with modern, well-supported open-source technologies:

- **Backend**: Node.js with TypeScript, Express.js, Prisma ORM, PostgreSQL 16
- **Frontend**: React 19, Vite, Material-UI v6, Zustand state management
- **Real-time**: Socket.IO (SSH terminals, notifications, gateway monitoring), guacamole-lite (RDP)
- **Security**: AES-256-GCM encryption, Argon2id key derivation, bcrypt password hashing, JWT authentication, WebAuthn
- **Infrastructure**: Docker/Podman containerization, nginx reverse proxy, optional SSH gateway bastion

The codebase follows a clean layered architecture (routes, controllers, services, data access) and is designed to be extensible and contribution-friendly with comprehensive documentation.
