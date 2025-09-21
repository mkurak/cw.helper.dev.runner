# Changelog

## [1.0.9] - 2025-09-21
### Changed
- Pre-commit hook now runs format, lint, coverage, build, and smoke (`node scripts/smoke.mjs`) to block invalid deployments.

## [1.0.8] - 2025-09-21
### Changed
- Pre-commit hook now fails unless format, lint, coverage, build, and smoke (node scripts/smoke.mjs) all succeed.

### Changed
- Removed the post-commit hook that attempted to tag releases automatically.

## [1.0.7] - 2025-09-21
### Added
- Added a post-commit hook that tags and pushes version bumps automatically on the default branch.

## [1.0.6] - 2025-09-21
### Changed
- Removed the legacy `scripts/release.mjs` helper; releases now rely on `npm version <type>` followed by `git push --follow-tags`.

## [1.0.5] - 2025-09-21
### Fixed
- Adjusted deployment metadata after the release script removal so CI publishing succeeds.

## [1.0.4] - 2025-09-21
### Changed
- Dropped the `release` npm script from package metadata and updated docs to reference `npm version <type>` for bumps.

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
