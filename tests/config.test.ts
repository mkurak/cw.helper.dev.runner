import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadConfig, resolveConfig } from '../src/config';
import type { RunnerConfig } from '../src/types';

describe('config', () => {
    it('loads default configuration when no file exists', () => {
        const { config, configPath } = loadConfig();
        expect(config).toEqual({});
        expect(configPath).toBeUndefined();
    });

    it('resolves defaults correctly', () => {
        const resolved = resolveConfig({});
        expect(resolved.watchDirs).toEqual([path.resolve(process.cwd(), 'src')]);
        expect(resolved.run.command).toBe('node');
        expect(resolved.run.args).toEqual(['dist/index.js']);
    });

    it('supports configuration file', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cw-runner-'));
        const configPath = path.join(tempDir, 'cw-dev-runner.config.json');
        const config: RunnerConfig = {
            watchDirs: ['src', 'tests'],
            ignore: ['dist'],
            run: {
                command: 'node',
                args: ['dist/server.js']
            }
        };

        fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');

        const { config: loaded, configPath: loadedPath } = loadConfig(configPath);
        expect(loaded).toEqual(config);
        expect(loadedPath).toBe(configPath);

        const resolved = resolveConfig(loaded);
        expect(resolved.watchDirs).toContain(path.resolve(process.cwd(), 'src'));
        expect(resolved.watchDirs).toContain(path.resolve(process.cwd(), 'tests'));
        expect(resolved.ignore).toContain('dist');
        expect(resolved.run.args).toEqual(['dist/server.js']);
    });

    it('parses command string syntax', () => {
        const resolved = resolveConfig({
            run: 'node dist/server.js',
            build: 'npm run build'
        });

        expect(resolved.run.command).toBe('node');
        expect(resolved.run.args).toEqual(['dist/server.js']);
        expect(resolved.build?.command).toBe('npm');
        expect(resolved.build?.args).toEqual(['run', 'build']);
    });
});
