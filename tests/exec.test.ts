import { jest } from '@jest/globals';
import { EventEmitter } from 'node:events';
import type { ChildProcess } from 'node:child_process';

describe('exec helpers', () => {
    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks();
    });

    const createFailingSpawn = () =>
        jest.fn(() => {
            const emitter = new EventEmitter() as unknown as ChildProcess;
            emitter.kill = (() => true) as ChildProcess['kill'];
            process.nextTick(() => emitter.emit('error', new Error('boom')));
            return emitter;
        });

    it('rejects when spawn emits an error', async () => {
        const fakeSpawn = createFailingSpawn();

        await jest.unstable_mockModule('node:child_process', () => ({ spawn: fakeSpawn }));
        const exec = await import('../src/exec.js');

        await expect(exec.runCommandAwait('boom')).rejects.toThrow('boom');
    });

    it('logs when runCommand encounters an immediate spawn error', async () => {
        const fakeSpawn = createFailingSpawn();

        await jest.unstable_mockModule('node:child_process', () => ({ spawn: fakeSpawn }));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const exec = await import('../src/exec.js');

        const child = exec.runCommand('boom');
        await new Promise((resolve) => child.once('error', resolve));

        expect(consoleSpy).toHaveBeenCalled();
    });
});
