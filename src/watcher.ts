import fs from 'fs';
import path from 'path';
import { Logger } from './logger';

export type WatchEventType = 'change' | 'rename';

export interface WatchEvent {
  type: WatchEventType;
  filePath: string;
}

interface WatcherOptions {
  projectRoot: string;
  watchDirs: string[];
  ignore: string[];
  onChange: (event: WatchEvent) => void;
  logger: Logger;
}

export class DirectoryWatcher {
  private readonly watchers = new Map<string, fs.FSWatcher>();
  private readonly ignoreSet: Set<string>;
  private isRunning = false;

  constructor(private readonly options: WatcherOptions) {
    this.ignoreSet = new Set(options.ignore);
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    for (const dir of this.options.watchDirs) {
      this.watchDirectory(dir);
    }
  }

  stop(): void {
    this.isRunning = false;

    for (const watcher of this.watchers.values()) {
      watcher.close();
    }

    this.watchers.clear();
  }

  private watchDirectory(dirPath: string): void {
    if (this.watchers.has(dirPath)) {
      return;
    }

    if (!fs.existsSync(dirPath)) {
      return;
    }

    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
      return;
    }

    if (this.shouldIgnore(dirPath)) {
      return;
    }

    try {
      const watcher = fs.watch(dirPath, { recursive: false }, (eventType, filename) => {
        if (!this.isRunning) {
          return;
        }

        const resolvedPath = filename ? path.join(dirPath, filename.toString()) : dirPath;

        if (this.shouldIgnore(resolvedPath)) {
          return;
        }

        this.options.onChange({
          type: eventType as WatchEventType,
          filePath: resolvedPath
        });

        if (eventType === 'rename') {
          this.handlePotentialDirectory(resolvedPath);
        }
      });

      this.watchers.set(dirPath, watcher);
      this.options.logger.debug(`Watching directory: ${dirPath}`);

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const childPath = path.join(dirPath, entry.name);
          this.watchDirectory(childPath);
        }
      }
    } catch (error) {
      this.options.logger.error(`Failed to watch directory: ${dirPath}`, error);
    }
  }

  private handlePotentialDirectory(resolvedPath: string): void {
    if (!fs.existsSync(resolvedPath)) {
      return;
    }

    try {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        this.watchDirectory(resolvedPath);
      }
    } catch (error) {
      this.options.logger.error(`Failed to process rename event for: ${resolvedPath}`, error);
    }
  }

  private shouldIgnore(targetPath: string): boolean {
    const relative = path.relative(this.options.projectRoot, targetPath);
    if (relative.startsWith('..')) {
      return true;
    }

    const segments = relative.split(path.sep);
    return segments.some((segment) => this.ignoreSet.has(segment));
  }
}
