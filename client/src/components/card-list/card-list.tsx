import type { DroppableProvided } from '@hello-pangea/dnd';
import { Droppable } from '@hello-pangea/dnd';

import { type Card } from '../../common/types/types';
import { List } from './components/list';
import { ListWrapper } from './styled/list-wrapper';
import { ScrollContainer } from './styled/scroll-container';

type Props = {
  listId: string;
  listType: string;
  cards: Card[];
  onDeleteCard: (cardId: string, listId: string) => void;
  onRenameCard: (cardId: string, listId: string, newName: string) => void;
  onChangeCardDescription: (cardId: string, listId: string, newDescription: string) => void;
  onCopyCard: (cardId: string, listId: string) => void;
};

const CardsList = ({
  listId,
  listType,
  cards,
  onDeleteCard,
  onRenameCard,
  onChangeCardDescription,
  onCopyCard,
}: Props) => {
  return (
    <Droppable droppableId={listId} type={listType}>
      {(dropProvided: DroppableProvided) => (
        <ListWrapper {...dropProvided.droppableProps}>
          <ScrollContainer>
            <List
              cards={cards}
              dropProvided={dropProvided}
              listId={listId}
              onDeleteCard={onDeleteCard}
              onRenameCard={onRenameCard}
              onChangeCardDescription={onChangeCardDescription}
              onCopyCard={onCopyCard}
            />
          </ScrollContainer>
        </ListWrapper>
      )}
    </Droppable>
  );
};

export { CardsList };
