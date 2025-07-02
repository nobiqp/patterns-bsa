import { type List } from '../../common/types/types';
import { Originator, Memento, AppStateMemento, ActionParams } from './memento';

// PATTERN: Memento
export class WorkspaceOriginator implements Originator {
  private lists: List[];

  constructor(initialLists: List[] = []) {
    this.lists = initialLists;
  }

  public setLists(lists: List[]): void {
    this.lists = lists;
  }

  public getLists(): List[] {
    return this.lists;
  }

  public createMemento(
    actionType: string = 'unknown',
    actionParams: ActionParams | null = null
  ): Memento {
    return new AppStateMemento(this.lists, actionType, actionParams);
  }

  public restoreFromMemento(memento: Memento): void {
    this.lists = memento.getState();
  }

  public createMementoForAction(
    actionType: string,
    lists: List[],
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
