import { spawn } from 'node:child_process';

export interface RunResult {
    code: number | null;
    signal: NodeJS.Signals | null;
}

export function runCommand(cmd: string, opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) {
    // Use shell for simplicity of parsing strings
    const child = spawn(cmd, { stdio: 'inherit', shell: true, cwd: opts.cwd, env: opts.env });

    child.on('error', (error) => {
        console.error(`[cw-dev-runner] Failed to start command "${cmd}":`, error);
    });

    return child;
}

export function runCommandAwait(
    cmd: string,
    opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<RunResult> {
    return new Promise((resolve, reject) => {
        const child = runCommand(cmd, opts);
        child.once('error', (error) => reject(error));
        child.on('close', (code, signal) => resolve({ code, signal }));
    });
}
