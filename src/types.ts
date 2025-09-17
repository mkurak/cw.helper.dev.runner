// Command definitions used across the runner
export type CommandInput = string | CommandSpec;

export interface CommandSpec {
    command: string;
    args?: string[];
    shell?: boolean;
    env?: NodeJS.ProcessEnv;
}

export interface ResolvedCommandSpec {
    command: string;
    args: string[];
    shell: boolean;
    env: NodeJS.ProcessEnv;
}

// Public, user-provided config shape
export interface RunnerConfig {
    projectRoot?: string;
    watchDirs?: string[];
    ignore?: string[];
    debounceMs?: number;
    build?: CommandInput;
    run?: CommandInput;
}

// Fully resolved config used internally
export interface ResolvedRunnerConfig {
    projectRoot: string;
    watchDirs: string[];
    ignore: string[];
    debounceMs: number;
    build?: ResolvedCommandSpec;
    run: ResolvedCommandSpec;
}

// CLI-only options
export interface CliOptions {
    configPath?: string;
}

// Minimal CLI-specific config used by src/cli.ts
export interface DevRunnerConfig {
    cwd?: string;
    buildCommand?: string; // default: npm run build
    runCommand?: string; // default: node dist/server.js
    waitForPath?: string; // default: dist/server.js
    watch?: boolean; // default: true
    buildWatchCommand?: string; // default: npm run build -- --watch
    runWithNodeWatch?: boolean; // default: true
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
