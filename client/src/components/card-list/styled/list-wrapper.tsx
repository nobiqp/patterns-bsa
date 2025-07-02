import styled from '@emotion/styled';

import { SPACE_IN_PX } from '../../../common/constants/constants';

const ListWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.N30}
  display: flex;
  flex-direction: column;
  opacity: inherit;
  padding: ${SPACE_IN_PX}px;
  border: ${SPACE_IN_PX}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: 320px;
`;

export { ListWrapper };
