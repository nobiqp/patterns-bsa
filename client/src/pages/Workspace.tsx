import type { DraggableLocation, DroppableProvided, DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import React, { useContext, useEffect, useState } from 'react';

import { CardEvent, ListEvent } from '../common/enums/enums';
import { type List } from '../common/types/types';
import { Column } from '../components/column/column';
import { ColumnCreator } from '../components/column-creator/column-creator';
import { UndoRedoControls } from '../components/undo-redo-controls/undo-redo-controls';
import { SocketContext } from '../context/socket';
import { reorderService } from '../services/reorder.service';
import { updateListsArray } from '../utils/functional-utils';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { ActionType } from '../patterns/memento';
import { Container } from './styled/container';

export const Workspace = () => {
  const [lists, setLists] = useState<List[]>([]);
  const socket = useContext(SocketContext);

  // PATTERN: Memento - Track previous values for character-level undo/redo
  const previousValuesRef = React.useRef<Map<string, string>>(new Map());

  // PATTERN: Memento - Undo/Redo functionality
  const { saveStateForTextChange, undo, redo, canUndo, canRedo } = useUndoRedo(
    lists,
    setLists,
    socket
  );

  useEffect(() => {
    socket.emit(ListEvent.GET, (lists: List[]) => {
      setLists(lists);
      initializePreviousValues(lists);
    });

    socket.on(ListEvent.UPDATE, (lists: List[]) => {
      setLists(lists);
      initializePreviousValues(lists);
    });

    return () => {
      socket.removeAllListeners(ListEvent.UPDATE).close();
    };
  }, [socket]);

  const initializePreviousValues = (listsData: List[]) => {
    const prevValues = new Map<string, string>();

    listsData.forEach(list => {
      prevValues.set(`list_${list.id}`, list.name);

      list.cards.forEach(card => {
        prevValues.set(`card_name_${card.id}`, card.name);
        prevValues.set(`card_desc_${card.id}`, card.description || '');
      });
    });

    previousValuesRef.current = prevValues;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const source: DraggableLocation = result.source;
    const destination: DraggableLocation = result.destination;

    const isNotMoved =
      source.droppableId === destination.droppableId && source.index === destination?.index;

    if (isNotMoved) {
      return;
    }

    const isReorderLists = result.type === 'COLUMN';

    if (isReorderLists) {
      setLists(reorderService.reorderLists(source.index)(destination.index)(lists));
      socket.emit(ListEvent.REORDER, source.index, destination.index);

      return;
    }

    setLists(reorderService.reorderCards(source)(destination)(lists));
    socket.emit(CardEvent.REORDER, {
      sourceListId: source.droppableId,
      destinationListId: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
    });
  };

  const handleCreateList = (listName: string) => {
    socket.emit(ListEvent.CREATE, listName);
  };

  const handleDeleteList = (listId: string) => {
    socket.emit(ListEvent.DELETE, listId, () => {
      setLists(updateListsArray.removeList(listId));
    });
  };

  const handleRenameList = (listId: string, newName: string) => {
    const prevValueKey = `list_${listId}`;
    let oldName = previousValuesRef.current.get(prevValueKey);

    if (oldName === undefined) {
      const list = lists.find(l => l.id === listId);
      oldName = list?.name || '';
    }

    previousValuesRef.current.set(prevValueKey, oldName);

    if (oldName !== newName) {
      saveStateForTextChange(ActionType.RENAME_LIST, listId, oldName, newName);
    }

    previousValuesRef.current.set(prevValueKey, newName);

    socket.emit(ListEvent.RENAME, listId, newName, (updatedList: List) => {
      setLists(updateListsArray.updateList(updatedList));
    });
  };

  const handleCreateCard = (listId: string, cardName: string) => {
    socket.emit(CardEvent.CREATE, listId, cardName);
  };

  const handleDeleteCard = (cardId: string, listId: string) => {
    socket.emit(CardEvent.DELETE, cardId, listId);
  };

  const handleRenameCard = (cardId: string, listId: string, newName: string) => {
    const prevValueKey = `card_name_${cardId}`;
    let oldName = previousValuesRef.current.get(prevValueKey);

    if (oldName === undefined) {
      const list = lists.find(l => l.id === listId);
      const card = list?.cards.find(c => c.id === cardId);
      oldName = card?.name || '';
    }

    previousValuesRef.current.set(prevValueKey, oldName);

    if (oldName !== newName) {
      saveStateForTextChange(ActionType.RENAME_CARD, cardId, oldName, newName);
    }

    previousValuesRef.current.set(prevValueKey, newName);

    socket.emit(CardEvent.RENAME, cardId, listId, newName);
  };

  const handleChangeCardDescription = (cardId: string, listId: string, newDescription: string) => {
    const prevValueKey = `card_desc_${cardId}`;
    let oldDescription = previousValuesRef.current.get(prevValueKey);

    if (oldDescription === undefined) {
      const list = lists.find(l => l.id === listId);
      const card = list?.cards.find(c => c.id === cardId);
      oldDescription = card?.description || '';
    }

    previousValuesRef.current.set(prevValueKey, oldDescription);

    if (oldDescription !== newDescription) {
      saveStateForTextChange(
        ActionType.CHANGE_CARD_DESCRIPTION,
        cardId,
        oldDescription,
        newDescription
      );
    }

    previousValuesRef.current.set(prevValueKey, newDescription);

    socket.emit(CardEvent.CHANGE_DESCRIPTION, cardId, listId, newDescription);
  };

  const handleCopyCard = (cardId: string, listId: string) => {
    socket.emit(CardEvent.COPY, cardId, listId);
  };

  return (
    <React.Fragment>
      <UndoRedoControls canUndo={canUndo()} canRedo={canRedo()} onUndo={undo} onRedo={redo} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided: DroppableProvided) => (
            <Container
              className="workspace-container"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {lists.map((list: List, index: number) => (
                <Column
                  key={list.id}
                  index={index}
                  listName={list.name}
                  cards={list.cards}
                  listId={list.id}
                  onDeleteList={handleDeleteList}
                  onRenameList={handleRenameList}
                  onCreateCard={handleCreateCard}
                  onDeleteCard={handleDeleteCard}
                  onRenameCard={handleRenameCard}
                  onChangeCardDescription={handleChangeCardDescription}
                  onCopyCard={handleCopyCard}
                />
              ))}
              {provided.placeholder}
              <ColumnCreator onCreateList={handleCreateList} />
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </React.Fragment>
  );
};
