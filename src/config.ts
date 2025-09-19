import fs from 'node:fs';
import path from 'node:path';
import type {
    CommandInput,
    CommandSpec,
    ResolvedCommandSpec,
    ResolvedRunnerConfig,
    RunnerConfig
} from './types.js';

const DEFAULT_IGNORE = ['node_modules', 'dist', 'coverage', '.git'];
const DEFAULT_WATCH_DIRS = ['src'];
const DEFAULT_DEBOUNCE_MS = 200;
const DEFAULT_RUN_COMMAND: ResolvedCommandSpec = {
    command: 'node',
    args: ['dist/index.js'],
    shell: false,
    env: {}
};

export interface LoadedConfig {
    config: RunnerConfig;
    configPath?: string;
}

export function loadConfig(configPath?: string): LoadedConfig {
    const cwd = process.cwd();
    const resolvedPath = resolveConfigPath(configPath, cwd);

    if (!resolvedPath) {
        return { config: {} };
    }

    const data = fs.readFileSync(resolvedPath, 'utf8');
    const config = JSON.parse(data) as RunnerConfig;
    return { config, configPath: resolvedPath };
}

export function resolveConfig(
    rawConfig: RunnerConfig,
    overrides: Partial<RunnerConfig> = {}
): ResolvedRunnerConfig {
    const merged = { ...rawConfig, ...overrides };
    const projectRoot = path.resolve(merged.projectRoot ?? process.cwd());

    const ignore = normalizeIgnore(merged.ignore);
    const watchDirs = normalizeWatchDirs(merged.watchDirs, projectRoot);
    const debounceMs = merged.debounceMs ?? DEFAULT_DEBOUNCE_MS;

    const build = normalizeCommand(merged.build);
    const run = normalizeCommand(merged.run) ?? DEFAULT_RUN_COMMAND;

    return {
        projectRoot,
        watchDirs,
        ignore,
        debounceMs,
        build,
        run
    };
}

function resolveConfigPath(explicitPath: string | undefined, cwd: string): string | undefined {
    if (explicitPath) {
        const absolute = path.resolve(cwd, explicitPath);
        if (!fs.existsSync(absolute)) {
            throw new Error(`Config file not found at ${absolute}`);
        }
        return absolute;
    }

    const defaultPath = path.resolve(cwd, 'cw-dev-runner.config.json');
    if (fs.existsSync(defaultPath)) {
        return defaultPath;
    }

    return undefined;
}

function normalizeIgnore(ignore?: string[]): string[] {
    if (!ignore || ignore.length === 0) {
        return [...DEFAULT_IGNORE];
    }

    const set = new Set<string>(DEFAULT_IGNORE);
    for (const entry of ignore) {
        set.add(entry);
    }

    return Array.from(set);
}

function normalizeWatchDirs(watchDirs: string[] | undefined, projectRoot: string): string[] {
    const dirs = (watchDirs && watchDirs.length > 0 ? watchDirs : DEFAULT_WATCH_DIRS).map((dir) =>
        path.resolve(projectRoot, dir)
    );

    return Array.from(new Set(dirs));
}

function normalizeCommand(command?: CommandInput): ResolvedCommandSpec | undefined {
    if (!command) {
        return undefined;
    }

    const spec: CommandSpec = typeof command === 'string' ? parseCommandString(command) : command;
    const args = spec.args ?? [];
    return {
        command: spec.command,
        args,
        shell: spec.shell ?? false,
        env: spec.env ?? {}
    };
}

function parseCommandString(value: string): CommandSpec {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new Error('Command string cannot be empty');
    }

    const parts = trimmed.split(/\s+/);
    return {
        command: parts[0],
        args: parts.slice(1)
    };
}
