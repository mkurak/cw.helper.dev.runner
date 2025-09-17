import { Logger } from '../src/logger';

describe('Logger', () => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    afterEach(() => {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
    });

    it('emits messages according to level and includes scope', () => {
        const messages: string[] = [];
        console.log = (...args: any[]) => messages.push(args.join(' '));
        console.warn = (...args: any[]) => messages.push(args.join(' '));
        console.error = (...args: any[]) => messages.push(args.join(' '));

        const logger = new Logger('test-scope', 'debug');
        logger.debug('hello', { a: 1 });
        logger.info('world');
        logger.warn('careful');
        logger.error('boom');

        const joined = messages.join('\n');
        expect(joined).toContain('[DEBUG]');
        expect(joined).toContain('[INFO]');
        expect(joined).toContain('[WARN]');
        expect(joined).toContain('[ERROR]');
        expect(joined).toContain('[test-scope]');
    });

    it('suppresses debug when level is higher', () => {
        const messages: string[] = [];
        console.log = (...args: any[]) => messages.push(args.join(' '));

        const logger = new Logger('x', 'warn');
        logger.debug('hidden');
        logger.info('hidden');
        expect(messages.some((m) => m.includes('[DEBUG]') || m.includes('[INFO]'))).toBe(false);
    });
});

