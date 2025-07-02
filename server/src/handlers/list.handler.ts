import type { Socket } from 'socket.io';

import { ListEvent } from '../common/enums/enums';
import { List } from '../data/models/list';
import { LoggerFactory } from '../patterns/observer';
import { SocketHandler } from './socket.handler';

class ListHandler extends SocketHandler {
  private logger = LoggerFactory.getInstance();
  public handleConnection(socket: Socket): void {
    socket.on(ListEvent.CREATE, this.createList.bind(this));
    socket.on(ListEvent.GET, this.getLists.bind(this));
    socket.on(ListEvent.REORDER, this.reorderLists.bind(this));
    socket.on(ListEvent.DELETE, this.deleteList.bind(this));
    socket.on(ListEvent.RENAME, this.renameList.bind(this));
    socket.on('SYNC_STATE', this.syncState.bind(this));
  }

  private getLists(callback: (cards: List[]) => void): void {
    try {
      const lists = this.db.getData();
      callback(lists);
      this.logger.info(`Lists retrieved successfully`, { count: lists.length });
    } catch (error) {
      this.logger.error(`Failed to retrieve lists`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private reorderLists(sourceIndex: number, destinationIndex: number): void {
    try {
      const allLists = this.db.getData();
      const reorderedLists = this.reorderService.reorder(allLists, sourceIndex, destinationIndex);
      this.db.setData(reorderedLists);
      this.updateLists();

      this.logger.info(`Lists reordered successfully`, {
        sourceIndex,
        destinationIndex,
      });
    } catch (error) {
      this.logger.error(`Failed to reorder lists`, {
        sourceIndex,
        destinationIndex,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private createList(name: string): void {
    try {
      const allLists = this.db.getData();
      const newList = new List(name);
      this.db.setData(allLists.concat(newList));
      this.updateLists();

      this.logger.info(`List created successfully`, {
        listId: newList.id,
        name,
      });
    } catch (error) {
      this.logger.error(`Failed to create list`, {
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private deleteList(listId: string): void {
    try {
      const allLists = this.db.getData();
      const newList = allLists.filter(list => list.id !== listId);
      this.db.setData(newList);
      this.updateLists();

      this.logger.info(`List deleted successfully`, { listId });
    } catch (error) {
      this.logger.error(`Failed to delete list`, {
        listId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private renameList(listId: string, newName: string): void {
    try {
      const allLists = this.db.getData();
      const listIndex = allLists.findIndex(list => list.id === listId);

      if (listIndex !== -1) {
        allLists[listIndex].name = newName;
        this.db.setData(allLists);
        this.updateLists();

        this.logger.info(`List renamed successfully`, { listId, newName });
      } else {
        this.logger.warning(`List not found for renaming`, { listId, newName });
      }
    } catch (error) {
      this.logger.error(`Failed to rename list`, {
        listId,
        newName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private syncState(newState: List[], callback?: (lists: List[]) => void): void {
    try {
      this.db.setData(newState);
      
      // Broadcast to all users for undo/redo operations
      this.updateLists();
      
      // Also send back to the requesting user if callback provided
      if (callback) {
        const lists = this.db.getData();
        callback(lists);
      }

      this.logger.info(`State synchronized successfully (undo/redo)`, {
        listsCount: newState.length,
      });
    } catch (error) {
      this.logger.error(`Failed to sync state`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export { ListHandler };
