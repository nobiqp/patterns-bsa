import { DroppableProvided } from '@hello-pangea/dnd';

import { type Card } from '../../../common/types/types';
import { DropZone } from '../styled/drop-zone';
import { Cards } from './cards';

type Props = {
  dropProvided: DroppableProvided;
  cards: Card[];
  listId: string;
  onDeleteCard: (cardId: string, listId: string) => void;
  onRenameCard: (cardId: string, listId: string, newName: string) => void;
  onChangeCardDescription: (cardId: string, listId: string, newDescription: string) => void;
  onCopyCard: (cardId: string, listId: string) => void;
};

const List = ({
  cards,
  dropProvided,
  listId,
  onDeleteCard,
  onRenameCard,
  onChangeCardDescription,
  onCopyCard,
}: Props) => {
  return (
    <div className="list-container">
      <DropZone ref={dropProvided.innerRef}>
        <Cards
          cards={cards}
          listId={listId}
          onDeleteCard={onDeleteCard}
          onRenameCard={onRenameCard}
          onChangeCardDescription={onChangeCardDescription}
          onCopyCard={onCopyCard}
        />
        {dropProvided.placeholder}
      </DropZone>
    </div>
  );
};

export { List };
