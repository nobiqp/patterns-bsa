import { Logger } from './logger';
import { FileLoggerObserver } from './file-logger.observer';
import { ConsoleLoggerObserver } from './console-logger.observer';

// PATTERN: Observer + Singleton
export class LoggerFactory {
  private static instance: Logger | null = null;

  public static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger();

      const fileLogger = new FileLoggerObserver();
      const consoleLogger = new ConsoleLoggerObserver();

      this.instance.attach(fileLogger);
      this.instance.attach(consoleLogger);
    }

    return this.instance;
  }
}
