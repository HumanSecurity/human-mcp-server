# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added

* HTTP (Streamable HTTP) transport mode via `MCP_TRANSPORT=http` environment variable, enabling clients with long per-call timeouts (e.g. Google ADK) to use the server without subprocess management.
* `GET /health` endpoint returns `{"status":"ok"}` for container liveness probes.
* `PORT`, `MCP_HTTP_HOST`, `MCP_HTTP_ALLOWED_HOSTS`, and `MCP_HTTP_ALLOWED_ORIGINS` env vars for HTTP transport configuration.
* DNS-rebinding protection (`enableDnsRebindingProtection`) enabled by default in HTTP mode.
* Per-request stateless isolation in HTTP mode — each `POST /mcp` gets a fresh `McpServer` instance so concurrent callers never share state.

## [1.2.0] - 2026-07-02

### Added

* New `human_get_raw_activities` tool: given a Block ID / Reference ID or an IP address and a short time window (max 4 hours), returns matching raw activity records, the total count, and aggregated traffic metrics to help analyze why traffic is being blocked. Supports `limit` (1-100, default 20) and `offset` for paginating through matching records (sorted newest-first). Key analysis fields surfaced: `filterOriginReason`, `ruleName`, `displayScore`, `incidentTypes`, `trafficTags`, and `blockReference`.
* `searchQuery` support across all traffic data endpoints (`/overtime`, `/metrics`, `/tops/*`) for field-level filtering with boolean logic (AND, OR, NOT, parentheses). Available filter fields include: `socketIp`, `blockReference`, `displayScore`, `domain`, `path`, `filterOriginReason`, `ruleName`, `uaServer`, `knownBot`, `userEmail`, `httpMethod`, `httpStatusCode`, and more.

### Changed

* `human_get_traffic_data` tool description updated to document the new `searchQuery` capability, all available filter field keys, and a pointer to `human_get_raw_activities` for request-level records.

## [1.1.1] - 2026-07-02

### Fixed

* Corrected version numbering: `1.1.0` was inadvertently published to npm ahead of the `1.0.x` line and superseded by subsequent `1.0.x` releases, leaving the registry with out-of-order versions. Bumping to `1.1.1` restores strictly increasing semantic versioning going forward.

## [1.0.5] - 2026-07-01

### Changed

* Adjusted traffic data tool to new backend routes

## [1.0.4] - 2025-09-09

### Fixed

* Fixed service account permissions

## [1.0.3] - 2025-09-09

### Changed

* Docker container registry location

## [1.0.2] - 2025-09-08

### Fixed

* GCP marketplace annotation

## [1.0.1] - 2025-09-08

### Added

* Docker container support with Google Cloud Marketplace compatibility
* Graceful shutdown on SIGINT and SIGTERM signals
* Multi-platform Docker images (linux/amd64, linux/arm64)
* Required marketplace annotation for service identification

### Changed

* Upgraded dependencies to latest versions

## [1.0.0] - 2025-07-22

### Changed

* Upgraded dependencies

## [1.0.0-beta1] - 2025-06-24

### Fixed

* Datetime description and error improvements
* Updated dependencies

## [1.0.0-beta] - 2025-06-19

### Fixed

* Refactoring, description improvements
* Renamed npm package
* Readme improvements

## [1.0.0-alpha] - 2025-06-11

### Added
* initial version
