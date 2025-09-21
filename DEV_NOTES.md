# Developer Notes — cw.helper.dev.runner

> Reference guide for future sessions when the conversation history is limited.

## Overview
- `cw.helper.dev.runner` is a lightweight development runner that watches directories, rebuilds, and restarts Node applications.
- Zero runtime dependencies; implemented in TypeScript and published as pure ESM.
- Requires Node.js 18+ for stable `fs.watch` behaviour and modern language features.
- CLI entry point: `cw-dev-runner` (aliased via `bin` in `package.json`).

## Architecture
- `src/config.ts` loads JSON configuration (`cw-dev-runner.config.json`) and normalises command specs.
- `src/watcher.ts` wraps `fs.watch` to recursively watch project directories with ignore rules.
- `src/processUtils.ts` and `src/exec.ts` provide process spawning helpers for build/run commands.
- `src/runner.ts` orchestrates rebuilds, restarts, and debounce handling.
- `src/cli.ts` glues everything together for CLI usage.
- `src/index.ts` re-exports `loadConfig`, `resolveConfig`, `DevRunner`, and related types.

## Build & Tooling
- Source code targets ES2020 with `moduleResolution: Bundler` to support `.js` extensions in ESM output.
- `tsconfig.json` covers both `src` and `tests` for editor tooling; `tsconfig.build.json` emits declarations/maps into `dist/`.
- Jest configuration (`jest.config.cjs`) uses `ts-jest/presets/default-esm` and maps `.js` extensions for relative imports.
- ESLint 9 flat config (`eslint.config.mjs`) paired with Prettier ensures consistent formatting.
- Git pre-commit hook runs format → lint → `npm run test:coverage` and reinstalls staged files (configured in `.githooks/pre-commit`).
- `npm run dev` uses `node --loader ts-node/esm src/cli.ts` for local experimentation.

## Scripts & Automation
- `npm run build` – compile to `dist/` using `tsconfig.build.json` (preserves CLI shebang).
- `npm run test` – run Jest with Node’s ESM VM modules flag.
- `npm run test:coverage` – same with coverage thresholds (90% statements/lines/functions).
- `npm run lint`, `npm run format`, `npm run format:check` – static analysis and formatting.
- `npm version <type>` – bumps the version and creates commit/tag; follow with `git push --follow-tags`.
- `npm run prepublishOnly` – build + smoke test (`scripts/smoke.mjs`) before `npm publish`.
- `npm run hooks:install` – sets `.githooks` via `scripts/setup-hooks.cjs`; invoked from `npm run prepare`.

## Release Workflow
1. Ensure working tree is clean and docs/changelog are updated.
2. Run tests/lint (`npm run lint && npm run test`).
3. Execute `npm version <type>` (e.g. `npm version patch --message "chore: release v%s"`).
4. Run `git push --follow-tags`; GitHub Actions `.github/workflows/publish.yml` publishes to npm with provenance once the tag lands on the default branch.

## Publishing Notes
- `publishConfig.provenance: true`; local manual publishes require `npm publish --no-provenance` or `NPM_CONFIG_PROVENANCE=false` if outside trusted builder.
- Keep `LICENSE`, `README.md`, and this file in sync with future changes; they are included in the published package.

## Testing Tips
- `tests/util.test.ts` creates temporary files in `coverage/` to avoid polluting the repo.
- Watch for race conditions when touching `fs.watch`; `DirectoryWatcher` already guards against duplicate watchers.
- When adding new modules, remember to export from `src/index.ts` and include `.js` extensions.
- `runCommandAwait` rejects when a command cannot be spawned; see `tests/exec.test.ts` for coverage.

## Future Ideas
- Integrate `cw.helper.colored.console` for ANSI styled logs.
- Provide presets for common frameworks (Express, Fastify) to simplify configuration.
- Optional integration with `chokidar` for more robust cross-platform watching if ever needed.

Keep this document updated whenever build tooling, release steps, or architecture change.
