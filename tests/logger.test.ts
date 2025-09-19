import { Logger } from '../src/logger.js';

const ESC = String.fromCharCode(27);
const ANSI_PATTERN = new RegExp(`${ESC}\\[[0-9;]*m`, 'g');
const stripAnsi = (value: string) => value.replace(ANSI_PATTERN, '');

describe('Logger', () => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const origDebug = console.debug;

    afterEach(() => {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
        console.debug = origDebug;
    });

    const capture =
        (messages: string[]) =>
        (...args: unknown[]) =>
            messages.push(args.map(String).join(' '));

    it('emits messages according to level and includes scope', () => {
        const messages: string[] = [];
        console.log = capture(messages);
        console.warn = capture(messages);
        console.error = capture(messages);
        console.debug = capture(messages);

        const logger = new Logger('test-scope', 'debug');
        logger.debug('hello', { a: 1 });
        logger.info('world');
        logger.warn('careful');
        logger.error('boom');

        const joined = stripAnsi(messages.join('\n'));
        expect(joined).toContain(' DEBUG ');
        expect(joined).toContain(' INFO ');
        expect(joined).toContain(' WARN ');
        expect(joined).toContain(' ERROR ');
        expect(joined).toContain('[test-scope]');
    });

    it('suppresses debug when level is higher', () => {
        const messages: string[] = [];
        console.log = capture(messages);

        const logger = new Logger('x', 'warn');
        logger.debug('hidden');
        logger.info('hidden');
        expect(
            messages.some((m) => {
                const text = stripAnsi(m);
                return text.includes('[DEBUG]') || text.includes('[INFO]');
            })
        ).toBe(false);
    });
});
