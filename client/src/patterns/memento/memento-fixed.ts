// PATTERN: Memento
// Base interfaces for the Memento pattern

export interface ActionParams {
  [key: string]: any;
}

export interface TextChangeData {
  itemType: 'list' | 'card';
  itemId: string;
  fieldType: 'name' | 'description';
  oldValue: string;
  newValue?: string;
  listId?: string; // For cards
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

// Concrete Memento implementation
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
    this.state = JSON.parse(JSON.stringify(state)); // Deep clone
    this.timestamp = new Date();
    this.actionType = actionType;
    this.actionParams = actionParams;
    this.textChangeData = textChangeData;
  }

  public getState(): any {
    return JSON.parse(JSON.stringify(this.state)); // Return deep clone
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
