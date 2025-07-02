import React from 'react';
import styled from '@emotion/styled';

const ControlsContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1000;
`;

const ControlButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: ${props => (props.disabled ? '#f0f0f0' : '#007acc')};
  color: ${props => (props.disabled ? '#999' : 'white')};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #005a9e;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const KeyboardHint = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 2px;
  line-height: 1;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

export const UndoRedoControls: React.FC<Props> = ({ canUndo, canRedo, onUndo, onRedo }) => {
  return (
    <ControlsContainer>
      <ButtonContainer>
        <ControlButton disabled={!canUndo} onClick={onUndo} title="Undo (Ctrl+Z)">
          ↶
        </ControlButton>
        <KeyboardHint>Ctrl+Z</KeyboardHint>
      </ButtonContainer>

      <ButtonContainer>
        <ControlButton disabled={!canRedo} onClick={onRedo} title="Redo (Ctrl+Y)">
          ↷
        </ControlButton>
        <KeyboardHint>Ctrl+Y</KeyboardHint>
      </ButtonContainer>
    </ControlsContainer>
  );
};
