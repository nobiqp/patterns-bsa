import { List } from '../models/list';
import { Card } from '../models/card';

// UTILITY: Helper functions to ensure proper model instances
export class ModelFactory {
  /**
   * Ensures that a list object is a proper List instance with all methods
   */
  static ensureListInstance(listData: any): List {
    if (listData instanceof List) {
      // Already a proper List instance, but ensure cards are Card instances
      listData.cards = listData.cards.map(card => ModelFactory.ensureCardInstance(card));
      return listData;
    }

    // Create new List instance from plain object
    const list = new List(listData.name);
    list.id = listData.id;
    list.cards = (listData.cards || []).map((cardData: any) =>
      ModelFactory.ensureCardInstance(cardData)
    );

    return list;
  }

  /**
   * Ensures that a card object is a proper Card instance with all methods
   */
  static ensureCardInstance(cardData: any): Card {
    if (cardData instanceof Card) {
      return cardData;
    }

    // Create new Card instance from plain object
    const card = new Card(cardData.name, cardData.description || '');
    card.id = cardData.id;
    card.createdAt = cardData.createdAt ? new Date(cardData.createdAt) : card.createdAt;

    return card;
  }

  /**
   * Ensures that an array of lists contains proper List instances
   */
  static ensureListInstances(listsData: any[]): List[] {
    return listsData.map(listData => ModelFactory.ensureListInstance(listData));
  }
}
