import { spawn } from 'node:child_process';
import path from 'node:path';
import type { ResolvedCommandSpec } from './types.js';

export interface SpawnResult {
    code: number | null;
    signal: NodeJS.Signals | null;
}

export function executeCommand(command: ResolvedCommandSpec, cwd: string): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
        const resolvedCommand = resolveExecutable(command.command);
        const child = spawn(resolvedCommand, command.args, {
            cwd,
            stdio: 'inherit',
            shell: command.shell,
            env: { ...process.env, ...command.env }
        });

        child.on('error', (error) => {
            reject(error);
        });

        child.on('exit', (code, signal) => {
            resolve({ code, signal });
        });
    });
}

export function createProcessRunner(command: ResolvedCommandSpec, cwd: string) {
    let child = spawn(resolveExecutable(command.command), command.args, {
        cwd,
        stdio: 'inherit',
        shell: command.shell,
        env: { ...process.env, ...command.env }
    });

    function stop(signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
        return new Promise((resolve) => {
            if (!child || child.killed) {
                resolve();
                return;
            }

            const current = child;

            const handleExit = () => {
                current.removeAllListeners();
                resolve();
            };

            current.once('exit', handleExit);
            current.once('close', handleExit);

            try {
                current.kill(signal);
            } catch {
                resolve();
            }
        });
    }

    function restart(): void {
        const previous = child;
        previous.removeAllListeners();
        if (!previous.killed) {
            previous.kill('SIGTERM');
        }

        child = spawn(resolveExecutable(command.command), command.args, {
            cwd,
            stdio: 'inherit',
            shell: command.shell,
            env: { ...process.env, ...command.env }
        });
    }

    function isRunning(): boolean {
        return child && !child.killed;
    }

    return {
        get process() {
            return child;
        },
        stop,
        restart,
        isRunning
    };
}

export function resolveExecutable(executable: string): string {
    if (process.platform === 'win32') {
        if (executable === 'npm' || executable === 'npx') {
            return `${executable}.cmd`;
        }

        if (!path.extname(executable)) {
            return `${executable}.cmd`;
        }
    }

    return executable;
}
