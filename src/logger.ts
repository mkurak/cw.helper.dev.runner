export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function ts() {
    return new Date().toISOString();
}

export class Logger {
    constructor(
        private scope: string = 'cw-dev-runner',
        private level: LogLevel = 'info'
    ) {}

    private should(level: LogLevel): boolean {
        const order: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
        return order[level] >= order[this.level];
    }

    debug(msg: string, ...args: unknown[]) {
        if (this.should('debug')) console.log(`[${ts()}] [${this.scope}] [DEBUG] ${msg}`, ...args);
    }
    info(msg: string, ...args: unknown[]) {
        if (this.should('info')) console.log(`[${ts()}] [${this.scope}] [INFO] ${msg}`, ...args);
    }
    warn(msg: string, ...args: unknown[]) {
        if (this.should('warn')) console.warn(`[${ts()}] [${this.scope}] [WARN] ${msg}`, ...args);
    }
    error(msg: string, ...args: unknown[]) {
        if (this.should('error'))
            console.error(`[${ts()}] [${this.scope}] [ERROR] ${msg}`, ...args);
    }
}
