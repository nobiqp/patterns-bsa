// PATTERN: Functional Programming + Memento
import { type List } from '../common/types/types';
import { CardEvent, ListEvent } from '../common/enums/enums';

export interface StateAction {
  type:
    | 'LIST_CREATE'
    | 'LIST_DELETE'
    | 'LIST_RENAME'
    | 'LIST_REORDER'
    | 'CARD_CREATE'
    | 'CARD_DELETE'
    | 'CARD_RENAME'
    | 'CARD_CHANGE_DESCRIPTION'
    | 'CARD_COPY'
    | 'CARD_REORDER'
    | 'REPLACE_ALL';
  payload: any;
}

export const calculateStateDiff = (fromState: List[], toState: List[]): StateAction[] => {
  const actions: StateAction[] = [];

  if (JSON.stringify(fromState) !== JSON.stringify(toState)) {
    actions.push({
      type: 'REPLACE_ALL',
      payload: { lists: toState },
    });
  }

  return actions;
};

export const replayActions = (actions: StateAction[], socket: any): void => {
  actions.forEach(action => {
    switch (action.type) {
      case 'REPLACE_ALL':
        socket.emit('SYNC_STATE', action.payload.lists);
        break;
      case 'LIST_CREATE':
        socket.emit(ListEvent.CREATE, action.payload.name);
        break;
      case 'LIST_DELETE':
        socket.emit(ListEvent.DELETE, action.payload.listId);
        break;
      case 'LIST_RENAME':
        socket.emit(ListEvent.RENAME, action.payload.listId, action.payload.newName);
        break;
      case 'LIST_REORDER':
        socket.emit(ListEvent.REORDER, action.payload.sourceIndex, action.payload.destinationIndex);
        break;
      case 'CARD_CREATE':
        socket.emit(CardEvent.CREATE, action.payload.listId, action.payload.cardName);
        break;
      case 'CARD_DELETE':
        socket.emit(CardEvent.DELETE, action.payload.cardId, action.payload.listId);
        break;
      case 'CARD_RENAME':
        socket.emit(
          CardEvent.RENAME,
          action.payload.cardId,
          action.payload.listId,
          action.payload.newName
        );
        break;
      case 'CARD_CHANGE_DESCRIPTION':
        socket.emit(
          CardEvent.CHANGE_DESCRIPTION,
          action.payload.cardId,
          action.payload.listId,
          action.payload.newDescription
        );
        break;
      case 'CARD_COPY':
        socket.emit(CardEvent.COPY, action.payload.cardId, action.payload.listId);
        break;
      case 'CARD_REORDER':
        socket.emit(CardEvent.REORDER, {
          sourceListId: action.payload.sourceListId,
          destinationListId: action.payload.destinationListId,
          sourceIndex: action.payload.sourceIndex,
          destinationIndex: action.payload.destinationIndex,
        });
        break;
    }
  });
};

// Enhanced action replay service with state synchronization
export const actionReplayService = {
  // Calculate and replay actions to synchronize state
  syncState: (currentState: List[], targetState: List[], socket: any): void => {
    const actions = calculateStateDiff(currentState, targetState);
    replayActions(actions, socket);
  },

  // Direct state replacement for undo/redo operations (local only)
  replaceState: (newState: List[], socket: any): void => {
    // For undo/redo, we sync with server but don't broadcast to other users
    socket.emit('SYNC_STATE', newState, (_updatedState: List[]) => {
      // Server acknowledges the sync, but doesn't broadcast to others
    });
  },
};
