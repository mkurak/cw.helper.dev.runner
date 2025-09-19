import { waitForPath, deriveRunWatchCommand } from '../src/util.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';

describe('util', () => {
    it('deriveRunWatchCommand adds --watch for node commands', () => {
        expect(deriveRunWatchCommand('node dist/server.js')).toBe('node --watch dist/server.js');
        expect(deriveRunWatchCommand(' node  dist/app.js ')).toBe('node --watch dist/app.js');
        expect(deriveRunWatchCommand('npm run start')).toBe('npm run start');
    });

    it('waitForPath resolves true once file exists', async () => {
        const tmp = path.join(process.cwd(), 'coverage', `tmp_${Date.now()}.txt`);
        const p = waitForPath(tmp, { timeoutMs: 2000, intervalMs: 20 });
        // create file shortly after
        setTimeout(async () => {
            await fs.mkdir(path.dirname(tmp), { recursive: true });
            await fs.writeFile(tmp, 'ok');
        }, 50).unref();

        const ok = await p;
        expect(ok).toBe(true);
    });

    it('waitForPath returns false on timeout', async () => {
        const tmp = path.join(process.cwd(), 'coverage', `never_${Date.now()}.txt`);
        const ok = await waitForPath(tmp, { timeoutMs: 100, intervalMs: 20 });
        expect(ok).toBe(false);
    });
});
