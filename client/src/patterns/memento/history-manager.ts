import { Caretaker, Memento } from './memento';

// PATTERN: Memento
export class HistoryManager implements Caretaker {
  private history: Memento[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;
  private userId: string = '';
  private lastExternalUpdate: number = 0;

  constructor(userId?: string) {
    this.userId = userId || `user_${Math.random().toString(36).substr(2, 9)}`;
  }

  public saveMemento(memento: Memento): void {
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(memento);
    this.currentIndex++;

    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.currentIndex = this.maxHistorySize - 1;
    }
  }

  public clearRedoHistory(): void {
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.lastExternalUpdate = Date.now();
  }

  public resetHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.lastExternalUpdate = Date.now();
  }

  public undo(): Memento | null {
    if (!this.canUndo()) {
      return null;
    }

    // Move to previous state
    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  public redo(): Memento | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  public getCurrentState(): Memento | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  public getUserId(): string {
    return this.userId;
  }

  public shouldIgnoreExternalUpdate(timestamp: number = Date.now()): boolean {
    const lastUpdate = this.lastExternalUpdate || 0;
    return timestamp - lastUpdate < 100;
  }

  public getHistoryInfo(): {
    total: number;
    current: number;
    canUndo: boolean;
    canRedo: boolean;
    userId: string;
  } {
    return {
      total: this.history.length,
      current: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      userId: this.userId,
    };
  }
}
