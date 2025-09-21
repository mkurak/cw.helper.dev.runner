# cw.helper.dev.runner

`cw.helper.dev.runner` provides a lightweight development runtime that watches your project directories, triggers builds, and restarts your application without relying on external reload tools.

## Features

- Minimal dependencies — uses Node.js and TypeScript only
- Recursive directory watching with configurable ignore rules
- Optional build command before each restart
- CLI overrides for quick experimentation

## Installation

Install the runner alongside your service or library:

```bash
npm install --save-dev cw.helper.dev.runner
```

## Usage

Add a config file (`cw-dev-runner.config.json`) to your project:

```json
{
  "watchDirs": ["src"],
  "ignore": ["dist", "node_modules"],
  "build": "npm run build",
  "run": "node dist/server.js"
}
```

Then add an npm script:

```json
{
  "scripts": {
    "dev": "cw-dev-runner"
  }
}
```

Run `npm run dev` to start the watcher. You can override settings from the CLI:

```bash
cw-dev-runner --run "node dist/server.js" --no-build --watch src --watch tests
```

Use `cw-dev-runner --help` to see all available flags.

## Programmatic API

```ts
import { loadConfig, resolveConfig, DevRunner } from 'cw.helper.dev.runner';

const { config } = loadConfig();
const resolved = resolveConfig(config, { run: 'node dist/server.js' });

const runner = new DevRunner(resolved);
await runner.start();
```

Remember to call `runner.stop()` when you need to shut the watcher down programmatically.

## Tooling & Scripts

- `npm run build` – compile TypeScript to ESM output under `dist/`
- `npm run test` – execute Jest (ESM mode via `ts-jest` presets)
- `npm run test:coverage` – run tests with coverage thresholds enforced
- `npm run lint` – lint sources and tests with ESLint 9 flat config
- `npm run format` – apply Prettier formatting
- `npm version <type>` – bump version and create commit/tag (follow with `git push --follow-tags`)
- `npm run prepublishOnly` – build and execute the smoke test ahead of publishing

Pre-commit hooks (installed via `npm run prepare`) run format → lint → coverage to keep the repository consistent.

## Scripts

- `npm run build` – compile TypeScript to `dist`
- `npm test` – execute Jest test suite
- `npm run lint` – lint sources with ESLint
- `npm run format` – apply Prettier formatting rules

## Configuration Reference

- `watchDirs`: array of directories (relative to project root) to monitor
- `ignore`: directory names to ignore (merged with defaults: `node_modules`, `dist`, `coverage`, `.git`)
- `build`: command string or object executed before restarting the app
- `run`: command string or object that starts your application (defaults to `node dist/index.js`)
- `debounceMs`: delay before rerunning commands after changes (default: 200ms)
- `projectRoot`: override root directory (defaults to current working directory)

Enjoy your custom dev workflow! 🎯
