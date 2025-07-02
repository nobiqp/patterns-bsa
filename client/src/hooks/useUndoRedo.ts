import { useCallback, useRef, useEffect } from 'react';
import { type List } from '../common/types/types';
import { HistoryManager, WorkspaceOriginator, ActionType } from '../patterns/memento';
import { actionReplayService } from '../services/action-replay.service';

// PATTERN: Memento + Functional Programming - Character-level undo/redo for text changes only
export const useUndoRedo = (lists: List[], setLists: (lists: List[]) => void, socket: any) => {
  const historyManager = useRef(new HistoryManager());
  const originator = useRef(new WorkspaceOriginator());
  const isUndoRedoOperation = useRef(false);
  const isInitialized = useRef(false);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const initialTextStates = useRef<Map<string, List[]>>(new Map());

  useEffect(() => {}, [lists]);

  // PATTERN: Memento - Save state for text changes only
  const saveState = useCallback(
    (actionType: ActionType, stateBefore?: List[]) => {
      if (!isUndoRedoOperation.current) {
        const stateToSave = stateBefore || lists;
        const stateSnapshot = JSON.parse(JSON.stringify(stateToSave));
        const memento = originator.current.createMementoForAction(actionType, stateSnapshot);
        historyManager.current.saveMemento(memento);
        (historyManager.current as any).lastSaveTime = Date.now();
      }
    },
    [lists]
  );

  const saveStateForTextChange = useCallback(
    (actionType: ActionType, itemId: string, oldValue: string, newValue: string) => {
      if (isUndoRedoOperation.current) {
        return;
      }
      if (oldValue === newValue) {
        return;
      }

      const stateWithOldValue = recreateStateWithOldTextValue(lists, actionType, itemId, oldValue);

      const enhancedParams = {
        actionId: `${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        itemId,
        oldValue,
        newValue,
        itemType: actionType === ActionType.RENAME_LIST ? 'list' : 'card',
        fieldType: actionType === ActionType.CHANGE_CARD_DESCRIPTION ? 'description' : 'name',
      };

      const memento = originator.current.createMementoForAction(
        actionType,
        stateWithOldValue,
        enhancedParams
      );
      historyManager.current.saveMemento(memento);
    },
    [lists]
  );

  const recreateStateWithOldTextValue = (
    currentState: List[],
    actionType: ActionType,
    itemId: string,
    oldValue: string
  ): List[] => {
    const stateCopy = JSON.parse(JSON.stringify(currentState));

    if (actionType === ActionType.RENAME_LIST) {
      const list = stateCopy.find((l: List) => l.id === itemId);
      if (list) {
        list.name = oldValue;
      }
    } else if (actionType === ActionType.RENAME_CARD) {
      for (const list of stateCopy) {
        const card = list.cards.find((c: any) => c.id === itemId);
        if (card) {
          card.name = oldValue;
          break;
        }
      }
    } else if (actionType === ActionType.CHANGE_CARD_DESCRIPTION) {
      for (const list of stateCopy) {
        const card = list.cards.find((c: any) => c.id === itemId);
        if (card) {
          card.description = oldValue;
          break;
        }
      }
    }

    return stateCopy;
  };

  // PATTERN: Memento - Helper function for redo state recreation
  const recreateStateWithNewTextValue = (
    currentState: List[],
    actionType: ActionType,
    itemId: string,
    newValue: string
  ): List[] => {
    const stateCopy = JSON.parse(JSON.stringify(currentState));

    if (actionType === ActionType.RENAME_LIST) {
      const list = stateCopy.find((l: List) => l.id === itemId);
      if (list) {
        list.name = newValue;
      }
    } else if (actionType === ActionType.RENAME_CARD) {
      for (const list of stateCopy) {
        const card = list.cards.find((c: any) => c.id === itemId);
        if (card) {
          card.name = newValue;
          break;
        }
      }
    } else if (actionType === ActionType.CHANGE_CARD_DESCRIPTION) {
      for (const list of stateCopy) {
        const card = list.cards.find((c: any) => c.id === itemId);
        if (card) {
          card.description = newValue;
          break;
        }
      }
    }

    return stateCopy;
  };

  const undo = useCallback(() => {
    if (isUndoRedoOperation.current || !historyManager.current.canUndo()) {
      return;
    }

    isUndoRedoOperation.current = true;

    const memento = historyManager.current.undo();
    if (memento) {
      const previousState = memento.getState();

      const currentLists = lists;
      const shouldRestore = validateTextOnlyRestore(currentLists, previousState);

      if (shouldRestore) {
        const mergedState = mergeTextChanges(currentLists, previousState);
        setLists(mergedState);
        actionReplayService.replaceState(mergedState, socket);
      } else {
        isUndoRedoOperation.current = false;
        return;
      }
    }

    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 200);
  }, [setLists, socket, lists]);

  const redo = useCallback(() => {
    if (isUndoRedoOperation.current || !historyManager.current.canRedo()) {
      return;
    }

    isUndoRedoOperation.current = true;

    const memento = historyManager.current.redo();
    if (memento) {
      const actionParams = memento.getActionParams();

      if (actionParams && actionParams.newValue !== undefined) {
        const { itemId, newValue } = actionParams;
        const redoState = recreateStateWithNewTextValue(
          lists,
          memento.getActionType() as ActionType,
          itemId,
          newValue
        );
        const shouldRestore = validateTextOnlyRestore(lists, redoState);

        if (shouldRestore) {
          const mergedState = mergeTextChanges(lists, redoState);
          setLists(mergedState);
          actionReplayService.replaceState(mergedState, socket);
        } else {
          isUndoRedoOperation.current = false;
          return;
        }
      } else {
        const nextState = memento.getState();
        const shouldRestore = validateTextOnlyRestore(lists, nextState);

        if (shouldRestore) {
          const mergedState = mergeTextChanges(lists, nextState);
          setLists(mergedState);
          actionReplayService.replaceState(mergedState, socket);
        } else {
          isUndoRedoOperation.current = false;
          return;
        }
      }
    }

    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 200);
  }, [setLists, socket, lists]);

  const mergeTextChanges = (currentState: List[], targetState: List[]): List[] => {
    const mergedState = currentState.map(currentList => {
      const targetList = targetState.find(list => list.id === currentList.id);

      if (!targetList) {
        return currentList;
      }

      const updatedList = {
        ...currentList,
        name: targetList.name,
        cards: currentList.cards.map(currentCard => {
          const targetCard = targetList.cards.find(card => card.id === currentCard.id);

          if (!targetCard) {
            // Card doesn't exist in target, keep current card as-is
            return currentCard;
          }

          // Merge card text properties from target
          return {
            ...currentCard,
            name: targetCard.name, // Use target card name
            description: targetCard.description, // Use target card description
          };
        }),
      };

      return updatedList;
    });

    return mergedState;
  };

  // Helper function to validate if a restore operation is safe for text-only changes
  const validateTextOnlyRestore = (currentState: List[], targetState: List[]): boolean => {
    // Check if the target state would bring back deleted lists
    const currentListIds = new Set(currentState.map(list => list.id));
    const targetListIds = new Set(targetState.map(list => list.id));

    // If target has lists that current doesn't have, it might restore deleted lists
    const hasDeletedLists = Array.from(targetListIds).some(id => !currentListIds.has(id));
    if (hasDeletedLists) {
      return false;
    }

    // Check if the target state would bring back deleted cards
    for (const targetList of targetState) {
      const currentList = currentState.find(list => list.id === targetList.id);
      if (currentList) {
        const currentCardIds = new Set(currentList.cards.map(card => card.id));
        const targetCardIds = new Set(targetList.cards.map(card => card.id));

        // If target has cards that current doesn't have, it might restore deleted cards
        const hasDeletedCards = Array.from(targetCardIds).some(id => !currentCardIds.has(id));
        if (hasDeletedCards) {
          return false;
        }
      }
    }

    return true;
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const getHistoryInfo = useCallback(() => {
    return historyManager.current.getHistoryInfo();
  }, []);

  const canUndo = useCallback(() => {
    return historyManager.current.canUndo();
  }, []);

  const canRedo = useCallback(() => {
    return historyManager.current.canRedo();
  }, []);

  const clearHistory = useCallback(() => {
    historyManager.current.clear();
  }, []);

  // Reset history completely (for full state sync)
  const resetHistory = useCallback(() => {
    historyManager.current.resetHistory();
    isInitialized.current = false; // Reset initialization flag
  }, []);

  // Initialize with current state - improved version
  useEffect(() => {
    // Only initialize if we have data, haven't initialized yet, and not in undo/redo operation
    if (lists.length > 0 && !isInitialized.current && !isUndoRedoOperation.current) {
      // Create initial memento directly without going through saveState
      const stateSnapshot = JSON.parse(JSON.stringify(lists));
      const memento = originator.current.createMementoForAction(
        ActionType.INITIAL_STATE,
        stateSnapshot
      );
      historyManager.current.saveMemento(memento);
      isInitialized.current = true;
    }
  }, [lists]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    const states = initialTextStates.current;

    return () => {
      // Clear all pending timers
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
      states.clear();
    };
  }, []);

  return {
    saveState,
    saveStateForTextChange,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    resetHistory,
    getHistoryInfo,
  };
};
