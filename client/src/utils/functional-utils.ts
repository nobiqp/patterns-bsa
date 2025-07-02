// PATTERN: Functional Programming
import { type List } from '../common/types/types';

export const updateListsArray = {
  addList:
    (newList: List) =>
    (prevLists: List[]): List[] => [...prevLists, newList],

  removeList:
    (listId: string) =>
    (prevLists: List[]): List[] =>
      prevLists.filter(list => list.id !== listId),

  updateList:
    (updatedList: List) =>
    (prevLists: List[]): List[] =>
      prevLists.map(list => (list.id === updatedList.id ? updatedList : list)),

  replaceLists:
    (newLists: List[]) =>
    (_prevLists: List[]): List[] =>
      newLists,
};

export const createSocketHandler =
  <T extends any[]>(
    socket: any,
    event: string,
    _stateUpdater: (updateFn: (prev: List[]) => List[]) => void
  ) =>
  (...args: T) => {
    socket.emit(event, ...args);
  };

export const createSocketHandlerWithCallback =
  <T extends any[]>(
    socket: any,
    event: string,
    stateUpdater: (updateFn: (prev: List[]) => List[]) => void,
    listUpdateFn: (result: any) => (prev: List[]) => List[]
  ) =>
  (arg: T[0]) => {
    socket.emit(event, arg, (result: any) => {
      stateUpdater(listUpdateFn(result));
    });
  };

export const conditional = <T>(predicate: boolean, onTrue: () => T, onFalse: () => T): T =>
  predicate ? onTrue() : onFalse();

export const guard = <T>(condition: boolean, value: T): T | undefined =>
  condition ? value : undefined;
