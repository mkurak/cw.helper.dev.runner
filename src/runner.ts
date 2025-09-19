import { ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
import { DirectoryWatcher } from './watcher.js';
import { Logger } from './logger.js';
import type { ResolvedRunnerConfig } from './types.js';
import { executeCommand, resolveExecutable } from './processUtils.js';

export class DevRunner {
    private watcher?: DirectoryWatcher;
    private runProcess?: ChildProcess;
    private restartTimer?: NodeJS.Timeout;
    private rebuildPromise?: Promise<void>;
    private pendingReason: string | null = null;
    private stopping = false;

    constructor(
        private readonly config: ResolvedRunnerConfig,
        private readonly logger = new Logger()
    ) {}

    async start(): Promise<void> {
        this.logger.info('Starting development runner');

        this.watcher = new DirectoryWatcher({
            projectRoot: this.config.projectRoot,
            watchDirs: this.config.watchDirs,
            ignore: this.config.ignore,
            onChange: (event) => this.handleFileChange(event.filePath, event.type),
            logger: this.logger
        });

        this.watcher.start();

        await this.triggerRebuild('initial startup');
    }

    async stop(): Promise<void> {
        this.stopping = true;

        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = undefined;
        }

        if (this.watcher) {
            this.watcher.stop();
        }

        await this.stopRunProcess('SIGTERM');
    }

    private handleFileChange(filePath: string, changeType: string): void {
        const relative = path.relative(this.config.projectRoot, filePath);
        this.logger.info(`Detected ${changeType} in ${relative}`);
        this.scheduleRestart(`change in ${relative}`);
    }

    private scheduleRestart(reason: string): void {
        if (this.stopping) {
            return;
        }

        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
        }

        this.restartTimer = setTimeout(() => {
            this.triggerRebuild(reason).catch((error) => {
                this.logger.error('Failed to restart after change', error);
            });
        }, this.config.debounceMs);
    }

    private async triggerRebuild(reason: string): Promise<void> {
        if (this.rebuildPromise) {
            this.pendingReason = reason;
            return this.rebuildPromise;
        }

        this.logger.info(`Rebuilding due to ${reason}`);
        this.rebuildPromise = this.rebuildAndRestart(reason);

        try {
            await this.rebuildPromise;
        } finally {
            this.rebuildPromise = undefined;
            if (this.pendingReason) {
                const nextReason = this.pendingReason;
                this.pendingReason = null;
                await this.triggerRebuild(nextReason);
            }
        }
    }

    private async rebuildAndRestart(reason: string): Promise<void> {
        if (this.config.build) {
            this.logger.info(`Running build command: ${this.describeCommand(this.config.build)}`);
            const result = await executeCommand(this.config.build, this.config.projectRoot);

            if (result.code !== 0) {
                this.logger.error(`Build command exited with code ${result.code ?? 'null'}`);
                return;
            }
        }

        await this.restartRunProcess();
        this.logger.info(`Application restarted after ${reason}`);
    }

    private async restartRunProcess(): Promise<void> {
        await this.stopRunProcess('SIGTERM');
        await this.startRunProcess();
    }

    private async stopRunProcess(signal: NodeJS.Signals): Promise<void> {
        const processRef = this.runProcess;
        if (!processRef) {
            return;
        }

        this.logger.info('Stopping running process');

        await new Promise<void>((resolve) => {
            const handleExit = () => {
                processRef.removeAllListeners();
                resolve();
            };

            processRef.once('exit', handleExit);
            processRef.once('close', handleExit);

            try {
                processRef.kill(signal);
            } catch {
                resolve();
            }

            setTimeout(() => {
                processRef.kill('SIGKILL');
            }, 2000).unref();
        });

        this.runProcess = undefined;
    }

    private async startRunProcess(): Promise<void> {
        const command = this.config.run;
        this.logger.info(`Starting command: ${this.describeCommand(command)}`);

        const child = spawn(resolveExecutable(command.command), command.args, {
            cwd: this.config.projectRoot,
            stdio: 'inherit',
            shell: command.shell,
            env: { ...process.env, ...command.env }
        });

        child.on('exit', (code, signal) => {
            if (this.stopping) {
                return;
            }

            if (code === 0) {
                this.logger.info(`Process exited cleanly with code ${code}`);
            } else {
                this.logger.warn(
                    `Process exited with code ${code ?? 'null'}${signal ? ` (signal: ${signal})` : ''}`
                );
            }
        });

        child.on('error', (error) => {
            this.logger.error('Failed to start run command', error);
        });

        this.runProcess = child;
    }

    private describeCommand(command: ResolvedRunnerConfig['run']): string {
        const parts = [resolveExecutable(command.command), ...command.args];
        return parts.join(' ');
    }
}
