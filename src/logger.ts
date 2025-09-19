import { createCwLogger } from 'cw.helper.colored.console/themes/cw';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function timestamp(): string {
    return new Date().toISOString();
}

export class Logger {
    private readonly colored: ReturnType<typeof createCwLogger>;

    constructor(
        private readonly scope: string = 'cw-dev-runner',
        private level: LogLevel = 'info'
    ) {
        this.colored = createCwLogger({ name: scope });
    }

    private should(level: LogLevel): boolean {
        const order: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
        return order[level] >= order[this.level];
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    debug(msg: string, ...args: unknown[]): void {
        if (this.should('debug')) {
            this.colored.debug(`[${timestamp()}] ${msg}`, ...args);
        }
    }

    info(msg: string, ...args: unknown[]): void {
        if (this.should('info')) {
            this.colored.info(`[${timestamp()}] ${msg}`, ...args);
        }
    }

    warn(msg: string, ...args: unknown[]): void {
        if (this.should('warn')) {
            this.colored.warn(`[${timestamp()}] ${msg}`, ...args);
        }
    }

    error(msg: string, ...args: unknown[]): void {
        if (this.should('error')) {
            this.colored.error(`[${timestamp()}] ${msg}`, ...args);
        }
    }
}
