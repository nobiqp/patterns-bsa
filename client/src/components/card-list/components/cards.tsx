import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Draggable } from '@hello-pangea/dnd';
import React from 'react';

import { type Card } from '../../../common/types/types';
import { CardItem } from '../../card-item/card-item';

type Props = {
  cards: Card[];
  listId: string;
  onDeleteCard: (cardId: string, listId: string) => void;
  onRenameCard: (cardId: string, listId: string, newName: string) => void;
  onChangeCardDescription: (cardId: string, listId: string, newDescription: string) => void;
  onCopyCard: (cardId: string, listId: string) => void;
};

const Cards = ({
  cards,
  listId,
  onDeleteCard,
  onRenameCard,
  onChangeCardDescription,
  onCopyCard,
}: Props) => (
  <React.Fragment>
    {cards.map((card: Card, index: number) => (
      <Draggable key={card.id} draggableId={card.id} index={index}>
        {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
          <CardItem
            key={card.id}
            card={card}
            isDragging={dragSnapshot.isDragging}
            provided={dragProvided}
            listId={listId}
            onDeleteCard={onDeleteCard}
            onRenameCard={onRenameCard}
            onChangeCardDescription={onChangeCardDescription}
            onCopyCard={onCopyCard}
          />
        )}
      </Draggable>
    ))}
  </React.Fragment>
);

export { Cards };
