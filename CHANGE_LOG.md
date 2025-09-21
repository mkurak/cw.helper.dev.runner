# Changelog

## [1.0.4] - 2025-09-21
### Changed
- Dropped the legacy `release` npm script; documentation now points to `node scripts/release.mjs <type>` for manual version bumps.

## [1.0.1] - 2025-09-19
### Fixed
- `runCommand`/`runCommandAwait` now attach spawn error handlers, preventing crashes and surfacing failures with clear logs.

### Added
- Tests covering command spawn error paths to guard against regressions.

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

## [0.2.5] - 2024-??-??
- Historical releases prior to the ESM migration (see git history for details).
