import type { Socket } from 'socket.io';

import { CardEvent } from '../common/enums/enums';
import { Card } from '../data/models/card';
import { LoggerFactory } from '../patterns/observer';
import { SocketHandler } from './socket.handler';

class CardHandler extends SocketHandler {
  private logger = LoggerFactory.getInstance();
  public handleConnection(socket: Socket): void {
    socket.on(CardEvent.CREATE, this.createCard.bind(this));
    socket.on(CardEvent.REORDER, this.reorderCards.bind(this));
    socket.on(CardEvent.DELETE, this.deleteCard.bind(this));
    socket.on(CardEvent.RENAME, this.renameCard.bind(this));
    socket.on(CardEvent.CHANGE_DESCRIPTION, this.changeCardDescription.bind(this));
    socket.on(CardEvent.COPY, this.copyCard.bind(this));
  }

  public createCard(listId: string, cardName: string): void {
    try {
      const newCard = new Card(cardName, '');
      const allLists = this.db.getData();

      const updatedLists = allLists.map(list =>
        list.id === listId ? list.setCards(list.cards.concat(newCard)) : list
      );

      this.db.setData(updatedLists);
      this.updateLists();

      this.logger.info(`Card created successfully`, {
        cardId: newCard.id,
        cardName,
        listId,
      });
    } catch (error) {
      this.logger.error(`Failed to create card`, {
        cardName,
        listId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private reorderCards({
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): void {
    try {
      const allLists = this.db.getData();
      const reordered = this.reorderService.reorderCards({
        lists: allLists,
        sourceIndex,
        destinationIndex,
        sourceListId,
        destinationListId,
      });
      this.db.setData(reordered);
      this.updateLists();

      this.logger.info(`Cards reordered successfully`, {
        sourceIndex,
        destinationIndex,
        sourceListId,
        destinationListId,
      });
    } catch (error) {
      this.logger.error(`Failed to reorder cards`, {
        sourceIndex,
        destinationIndex,
        sourceListId,
        destinationListId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private deleteCard(cardId: string, listId: string): void {
    try {
      const allLists = this.db.getData();
      const updatedLists = allLists.map(list =>
        list.id === listId ? list.setCards(list.cards.filter(card => card.id !== cardId)) : list
      );

      this.db.setData(updatedLists);
      this.updateLists();

      this.logger.info(`Card deleted successfully`, { cardId, listId });
    } catch (error) {
      this.logger.error(`Failed to delete card`, {
        cardId,
        listId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private renameCard(cardId: string, listId: string, newName: string): void {
    try {
      const allLists = this.db.getData();
      const updatedLists = allLists.map(list => {
        if (list.id === listId) {
          const updatedCards = list.cards.map(card => {
            if (card.id === cardId) {
              card.name = newName;
              return card;
            }
            return card;
          });
          return list.setCards(updatedCards);
        }
        return list;
      });

      this.db.setData(updatedLists);
      this.updateLists();

      this.logger.info(`Card renamed successfully`, { cardId, listId, newName });
    } catch (error) {
      this.logger.error(`Failed to rename card`, {
        cardId,
        listId,
        newName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private changeCardDescription(cardId: string, listId: string, newDescription: string): void {
    try {
      const allLists = this.db.getData();
      const updatedLists = allLists.map(list => {
        if (list.id === listId) {
          const updatedCards = list.cards.map(card => {
            if (card.id === cardId) {
              card.description = newDescription;
              return card;
            }
            return card;
          });
          return list.setCards(updatedCards);
        }
        return list;
      });

      this.db.setData(updatedLists);
      this.updateLists();

      this.logger.info(`Card description changed successfully`, {
        cardId,
        listId,
        newDescription,
      });
    } catch (error) {
      this.logger.error(`Failed to change card description`, {
        cardId,
        listId,
        newDescription,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // PATTERN: Prototype
  private copyCard(cardId: string, listId: string): void {
    try {
      const allLists = this.db.getData();
      const updatedLists = allLists.map(list => {
        if (list.id === listId) {
          const originalCard = list.cards.find(card => card.id === cardId);
          if (originalCard) {
            const clonedCard = originalCard.clone();
            this.logger.info(`Card duplicated successfully using Prototype pattern`, {
              originalCardId: cardId,
              newCardId: clonedCard.id,
              listId,
            });
            return list.setCards(list.cards.concat(clonedCard));
          } else {
            this.logger.warning(`Card not found for duplication`, { cardId, listId });
          }
        }
        return list;
      });

      this.db.setData(updatedLists);
      this.updateLists();
    } catch (error) {
      this.logger.error(`Failed to duplicate card`, {
        cardId,
        listId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export { CardHandler };
