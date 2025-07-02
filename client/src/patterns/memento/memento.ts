// PATTERN: Memento

export interface ActionParams {
  [key: string]: any;
}

export interface TextChangeData {
  itemType: 'list' | 'card';
  itemId: string;
  fieldType: 'name' | 'description';
  oldValue: string;
  newValue?: string;
  listId?: string;
}

export interface Memento {
  getState(): any;
  getTimestamp(): Date;
  getActionType(): string;
  getActionParams(): ActionParams | null;
  getTextChangeData?(): TextChangeData | null;
}

export interface Originator {
  createMemento(): Memento;
  restoreFromMemento(memento: Memento): void;
}

export interface Caretaker {
  saveMemento(memento: Memento): void;
  undo(): Memento | null;
  redo(): Memento | null;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}

export class AppStateMemento implements Memento {
  private state: any;
  private timestamp: Date;
  private actionType: string;
  private actionParams: ActionParams | null;
  private textChangeData: TextChangeData | null;

  constructor(
    state: any,
    actionType: string,
    actionParams: ActionParams | null = null,
    textChangeData: TextChangeData | null = null
  ) {
    this.state = JSON.parse(JSON.stringify(state));
    this.timestamp = new Date();
    this.actionType = actionType;
    this.actionParams = actionParams;
    this.textChangeData = textChangeData;
  }

  public getState(): any {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getTimestamp(): Date {
    return this.timestamp;
  }

  public getActionType(): string {
    return this.actionType;
  }

  public getActionParams(): ActionParams | null {
    return this.actionParams;
  }

  public getTextChangeData(): TextChangeData | null {
    return this.textChangeData;
  }
}

export class HistoryManager implements Caretaker {
  private history: Memento[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;

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
  }

  public resetHistory(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  public undo(): Memento | null {
    if (!this.canUndo()) {
      return null;
    }
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

  public getHistoryInfo(): {
    total: number;
    current: number;
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      total: this.history.length,
      current: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }
}

export class WorkspaceOriginator implements Originator {
  private lists: any[] = [];

  public setLists(lists: any[]): void {
    this.lists = lists;
  }

  public getLists(): any[] {
    return this.lists;
  }

  public createMemento(): Memento {
    return new AppStateMemento(this.lists, 'unknown', null);
  }

  public restoreFromMemento(memento: Memento): void {
    this.lists = memento.getState();
  }

  public createMementoForAction(
    actionType: string,
    lists: any[],
    actionParams: ActionParams | null = null
  ): Memento {
    const enhancedParams = {
      ...actionParams,
      actionId: `${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    return new AppStateMemento(lists, actionType, enhancedParams);
  }
}
