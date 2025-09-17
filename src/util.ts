import { stat } from 'node:fs/promises';

export async function waitForPath(
    path: string,
    opts: { timeoutMs?: number; intervalMs?: number } = {}
) {
    const timeoutMs = opts.timeoutMs ?? 30_000;
    const intervalMs = opts.intervalMs ?? 200;
    const start = Date.now();

    while (Date.now() - start <= timeoutMs) {
        try {
            const s = await stat(path);
            if (s.isFile() || s.isDirectory()) {
                return true;
            }
        } catch {
            // not exists yet
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return false;
}

export function deriveRunWatchCommand(runCommand: string): string {
    // If command starts with `node `, inject --watch after node
    const trimmed = runCommand.trim();
    if (trimmed.startsWith('node ')) {
        return trimmed.replace(/^node\s+/, 'node --watch ');
    }
    // Fallback: return as-is
    return runCommand;
}
