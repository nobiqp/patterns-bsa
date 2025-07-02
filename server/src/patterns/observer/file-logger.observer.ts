import * as fs from 'fs';
import * as path from 'path';
import { LogObserver, LogEntry } from './logger';

// PATTERN: Observer
export class FileLoggerObserver implements LogObserver {
  private logFilePath: string;

  constructor(logFilePath: string = 'logs/application.log') {
    this.logFilePath = logFilePath;
    this.ensureLogDirectoryExists();
  }

  private ensureLogDirectoryExists(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  public update(logEntry: LogEntry): void {
    const logMessage = this.formatLogMessage(logEntry);

    try {
      fs.appendFileSync(this.logFilePath, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private formatLogMessage(logEntry: LogEntry): string {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.toUpperCase().padEnd(7);
    const data = logEntry.data ? ` | Data: ${JSON.stringify(logEntry.data)}` : '';

    return `[${timestamp}] ${level} | ${logEntry.message}${data}`;
  }
}
