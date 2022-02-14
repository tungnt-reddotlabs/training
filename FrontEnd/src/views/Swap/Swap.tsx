import React from 'react';
import styled from 'styled-components';
import { screenUp } from '../../utils/styles';
import BoxSwap from '../../components/BoxSwap/BoxSwap';
import { useSetSwapPair } from '../../state/stableswap/hooks';

const Swap: React.FC = () => {
  useSetSwapPair();

  return (
    <BoxSwapContainer>
      <BoxSwap embedded />
    </BoxSwapContainer>
  );
};

const BoxSwapContainer = styled.div`
  margin: auto;
  ${screenUp('lg')`
    width: 650px;
  `}
`;

export default Swap;
