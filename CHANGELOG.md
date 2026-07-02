# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.0] - 2026-07-02

### Added

* New `human_investigate_block` tool: given a Block ID / Reference ID or an IP address and a short time window (max 1 hour), returns matching raw activity records (up to 20), the total count, and aggregated traffic metrics to help analyze why traffic is being blocked. Key analysis fields surfaced: `filterOriginReason`, `ruleName`, `displayScore`, `incidentTypes`, `trafficTags`, and `blockReference`.
* `searchQuery` support across all traffic data endpoints (`/overtime`, `/metrics`, `/tops/*`) for field-level filtering with boolean logic (AND, OR, NOT, parentheses). Available filter fields include: `socketIp`, `blockReference`, `displayScore`, `domain`, `path`, `filterOriginReason`, `ruleName`, `uaServer`, `knownBot`, `userEmail`, `httpMethod`, `httpStatusCode`, and more.

### Changed

* `human_get_traffic_data` tool description updated to document the new `searchQuery` capability and all available filter field keys.

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
