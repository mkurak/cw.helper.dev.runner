#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Logger } from './logger';
import { runCommand, runCommandAwait } from './exec';
import { waitForPath, deriveRunWatchCommand } from './util';
import type { CliOptions, DevRunnerConfig } from './types';

function parseArgs(argv: string[]): CliOptions {
    const out: CliOptions = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--config' && i + 1 < argv.length) {
            out.configPath = argv[++i];
        }
    }
    return out;
}

function loadConfig(configPath?: string): { config: DevRunnerConfig; path?: string } {
    const defaults: DevRunnerConfig = {
        cwd: process.cwd(),
        buildCommand: 'npm run build',
        runCommand: 'node dist/server.js',
        waitForPath: 'dist/server.js',
        watch: true,
        buildWatchCommand: 'npm run build -- --watch',
        runWithNodeWatch: true,
        logLevel: 'info'
    };

    if (!configPath) return { config: defaults };
    const abs = resolve(process.cwd(), configPath);
    const user = JSON.parse(readFileSync(abs, 'utf8')) as Partial<DevRunnerConfig>;
    return { config: { ...defaults, ...user }, path: abs };
}

async function main() {
    const args = parseArgs(process.argv);
    const { config, path } = loadConfig(args.configPath);
    const log = new Logger('cw-dev-runner', config.logLevel ?? 'info');
    if (path) log.info(`Using configuration from ${path}`);
    log.info('Starting development runner');

    // Initial build (blocking)
    log.info('Rebuilding due to initial startup');
    log.info(`Running build command: ${config.buildCommand}`);
    const buildResult = await runCommandAwait(config.buildCommand!, { cwd: config.cwd });
    if (buildResult.code !== 0) {
        log.error(`Build failed with code ${buildResult.code}`);
        process.exit(buildResult.code === null ? 1 : buildResult.code);
    }

    // Ensure the target exists before starting
    const waitTarget = resolve(config.cwd ?? process.cwd(), config.waitForPath!);
    const ok = await waitForPath(waitTarget, { timeoutMs: 30_000, intervalMs: 200 });
    if (!ok) {
        log.error(`Timed out waiting for ${waitTarget}`);
        process.exit(1);
    }

    let buildWatchProc: ReturnType<typeof runCommand> | undefined;
    let runProc: ReturnType<typeof runCommand> | undefined;

    const cleanup = () => {
        buildWatchProc?.kill();
        runProc?.kill();
    };
    process.on('SIGINT', () => {
        cleanup();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        cleanup();
        process.exit(0);
    });

    // Start watchers if enabled
    if (config.watch) {
        log.info('Starting build watcher');
        buildWatchProc = runCommand(config.buildWatchCommand!, { cwd: config.cwd });
    }

    // Start app (optionally with Node watch)
    const runCmd =
        config.watch && config.runWithNodeWatch
            ? deriveRunWatchCommand(config.runCommand!)
            : config.runCommand!;

    log.info(`Starting command: ${runCmd}`);
    runProc = runCommand(runCmd, { cwd: config.cwd, env: process.env });
    log.info('Application restarted after initial startup');

    runProc.on('close', (code) => {
        if (code !== null && code !== 0) {
            log.warn(`Process exited with code ${code}`);
        }
    });
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
