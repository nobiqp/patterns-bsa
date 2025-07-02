import type { DraggableLocation } from '@hello-pangea/dnd';

import { type Card, type List } from '../common/types/types';

const moveItem =
  <T>(fromIndex: number, toIndex: number) =>
  (items: T[]): T[] => {
    const itemsCopy = [...items];
    const [movedItem] = itemsCopy.splice(fromIndex, 1);
    itemsCopy.splice(toIndex, 0, movedItem);
    return itemsCopy;
  };

const removeAtIndex =
  <T>(index: number) =>
  (items: T[]): T[] => {
    const [before, after] = [items.slice(0, index), items.slice(index + 1)];
    return [...before, ...after];
  };

const insertAtIndex =
  <T>(index: number, item: T) =>
  (items: T[]): T[] => {
    const [before, after] = [items.slice(0, index), items.slice(index)];
    return [...before, item, ...after];
  };

const findListById =
  (listId: string) =>
  (lists: List[]): List | undefined =>
    lists.find(list => list.id === listId);

const updateListById =
  (listId: string, updateFn: (list: List) => List) =>
  (lists: List[]): List[] =>
    lists.map(list => (list.id === listId ? updateFn(list) : list));

const updateListCards =
  (cardsFn: (cards: Card[]) => Card[]) =>
  (list: List): List => ({
    ...list,
    cards: cardsFn(list.cards),
  });

const getCardsFromListId =
  (listId: string) =>
  (lists: List[]): Card[] => {
    const list = findListById(listId)(lists);
    return list?.cards || [];
  };

const isSameListMovement = (source: DraggableLocation, destination: DraggableLocation): boolean =>
  source.droppableId === destination.droppableId;

const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (initialValue: T): T =>
    fns.reduce((acc, fn) => fn(acc), initialValue);

const curry =
  <T, U, V>(fn: (a: T, b: U) => V) =>
  (a: T) =>
  (b: U) =>
    fn(a, b);
const curry3 =
  <T, U, V, W>(fn: (a: T, b: U, c: V) => W) =>
  (a: T) =>
  (b: U) =>
  (c: V) =>
    fn(a, b, c);

const reorderListsImpl = (startIndex: number, endIndex: number, lists: List[]): List[] =>
  moveItem<List>(startIndex, endIndex)(lists);

const reorderCardsInSameListImpl = (
  source: DraggableLocation,
  destination: DraggableLocation,
  lists: List[]
): List[] =>
  updateListById(
    source.droppableId,
    updateListCards(moveItem<Card>(source.index, destination.index))
  )(lists);

const reorderCardsBetweenListsImpl = (
  source: DraggableLocation,
  destination: DraggableLocation,
  lists: List[]
): List[] => {
  const sourceCards = getCardsFromListId(source.droppableId)(lists);
  const targetCard = sourceCards[source.index];

  return compose<List[]>(
    updateListById(source.droppableId, updateListCards(removeAtIndex<Card>(source.index))),
    updateListById(
      destination.droppableId,
      updateListCards(insertAtIndex<Card>(destination.index, targetCard))
    )
  )(lists);
};

const reorderCardsImpl = (
  source: DraggableLocation,
  destination: DraggableLocation,
  lists: List[]
): List[] => {
  const reorderFn = isSameListMovement(source, destination)
    ? reorderCardsInSameListImpl
    : reorderCardsBetweenListsImpl;

  return reorderFn(source, destination, lists);
};

const reorderLists = curry3(reorderListsImpl);
const reorderCards = curry3(reorderCardsImpl);

const removeCardFromList = curry((index: number, cards: Card[]): Card[] =>
  removeAtIndex<Card>(index)(cards)
);

const addCardToList = curry3((index: number, card: Card, cards: Card[]): Card[] =>
  insertAtIndex<Card>(index, card)(cards)
);

export const reorderService = {
  reorderLists,
  reorderCards,
  removeCardFromList,
  addCardToList,
};
