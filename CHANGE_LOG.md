# Changelog

## [1.0.0] - 2025-09-19
### Added
- GitHub Actions workflow for provenance-backed npm publishing.
- Smoke test to validate published exports before release.
- Developer notes documenting architecture, tooling, and release process.
- MIT license file and enriched README with tooling guidance.
- Automated release script and prepublish checks mirroring other cw helper packages.

### Changed
- Migrated build output to pure ESM with exports map and bundler module resolution.
- Updated Jest, TypeScript, and npm scripts to use ESM-friendly configurations.
- Enhanced package metadata (keywords, repository, engines, files list) for npm distribution.
- Added error handling for spawned commands so CLI failures are surfaced instead of crashing the process.

## [0.2.5] - 2024-??-??
- Historical releases prior to the ESM migration (see git history for details).
