import type { DraggableProvided } from '@hello-pangea/dnd';

import { type Card } from '../../common/types/types';
import { CopyButton } from '../primitives/copy-button';
import { DeleteButton } from '../primitives/delete-button';
import { Splitter } from '../primitives/styled/splitter';
import { Text } from '../primitives/text';
import { Title } from '../primitives/title';
import { Container } from './styled/container';
import { Content } from './styled/content';
import { Footer } from './styled/footer';

type Props = {
  card: Card;
  isDragging: boolean;
  provided: DraggableProvided;
  listId: string;
  onDeleteCard: (cardId: string, listId: string) => void;
  onRenameCard: (cardId: string, listId: string, newName: string) => void;
  onChangeCardDescription: (cardId: string, listId: string, newDescription: string) => void;
  onCopyCard: (cardId: string, listId: string) => void;
};

export const CardItem = ({
  card,
  isDragging,
  provided,
  listId,
  onDeleteCard,
  onRenameCard,
  onChangeCardDescription,
  onCopyCard,
}: Props) => {
  const handleRenameCard = (newName: string) => {
    onRenameCard(card.id, listId, newName);
  };

  const handleDeleteCard = () => {
    onDeleteCard(card.id, listId);
  };

  const handleChangeDescription = (newDescription: string) => {
    onChangeCardDescription(card.id, listId, newDescription);
  };

  const handleCopyCard = () => {
    onCopyCard(card.id, listId);
  };

  return (
    <Container
      className="card-container"
      isDragging={isDragging}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      data-is-dragging={isDragging}
      data-testid={card.id}
      aria-label={card.name}
    >
      <Content>
        <Title onChange={handleRenameCard} title={card.name} fontSize="large" isBold />
        <Text text={card.description} onChange={handleChangeDescription} />
        <Footer>
          <DeleteButton onClick={handleDeleteCard} />
          <Splitter />
          <CopyButton onClick={handleCopyCard} />
        </Footer>
      </Content>
    </Container>
  );
};
