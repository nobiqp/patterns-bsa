// PATTERN: Observer

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

export interface LogObserver {
  update(logEntry: LogEntry): void;
}

export interface LogSubject {
  attach(observer: LogObserver): void;
  detach(observer: LogObserver): void;
  notify(logEntry: LogEntry): void;
}

export class Logger implements LogSubject {
  private observers: LogObserver[] = [];

  public attach(observer: LogObserver): void {
    this.observers.push(observer);
  }

  public detach(observer: LogObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public notify(logEntry: LogEntry): void {
    for (const observer of this.observers) {
      observer.update(logEntry);
    }
  }

  public info(message: string, data?: any): void {
    const logEntry: LogEntry = {
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      data,
    };
    this.notify(logEntry);
  }

  public warning(message: string, data?: any): void {
    const logEntry: LogEntry = {
      level: LogLevel.WARNING,
      message,
      timestamp: new Date(),
      data,
    };
    this.notify(logEntry);
  }

  public error(message: string, data?: any): void {
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      data,
    };
    this.notify(logEntry);
  }

  public log(level: LogLevel, message: string, data?: any): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
    };
    this.notify(logEntry);
  }
}
