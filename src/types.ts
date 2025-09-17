export interface DevRunnerConfig {
  // Project root where commands run
  cwd?: string;
  // Command to build once
  buildCommand?: string; // default: npm run build
  // Command to run the app (without watch)
  runCommand?: string; // default: node dist/server.js
  // Wait for this path to exist after build before starting runCommand
  waitForPath?: string; // default: dist/server.js
  // Enable watch mode (build + run watchers)
  watch?: boolean; // default: true
  // Build command for watch (if not provided, uses buildCommand with --watch)
  buildWatchCommand?: string; // default: npm run build -- --watch
  // When true and runCommand starts with `node`, adds --watch to it
  runWithNodeWatch?: boolean; // default: true
  // Logging level
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface CliOptions {
  configPath?: string;
}

