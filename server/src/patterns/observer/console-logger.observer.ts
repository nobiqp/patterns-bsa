import { LogObserver, LogEntry, LogLevel } from './logger';

// PATTERN: Observer
export class ConsoleLoggerObserver implements LogObserver {
  public update(logEntry: LogEntry): void {
    if (logEntry.level === LogLevel.ERROR) {
      const logMessage = this.formatLogMessage(logEntry);
      console.error(logMessage);
    }
  }

  private formatLogMessage(logEntry: LogEntry): string {
    const timestamp = logEntry.timestamp.toISOString();
    const data = logEntry.data ? ` | Data: ${JSON.stringify(logEntry.data)}` : '';

    return `🚨 ERROR [${timestamp}] | ${logEntry.message}${data}`;
  }
}
