import React from 'react';
import styled from 'styled-components';
import { useAllPools } from '../../state/stablepool/hooks';
import { screenUp } from '../../utils/styles';
import PoolItem from './components/PoolItemNew';

const Pools: React.FC = () => {
  const pools = useAllPools();

  return (
    <StyledContainer>
      <StyledHeader>Pools</StyledHeader>
      <StyledContent>
        {(pools || []).map((pool, index) => (
          <PoolItem stablePool={pool} key={index} />
        ))}
      </StyledContent>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin: auto;
  ${screenUp('lg')`
    width: 1050px;
  `}
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  .tvl {
    margin-left: 0px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
  }
  span {
    padding-left: 10px;
    font-size: 20px;
    color: #ffffff;
  }
  ${screenUp('lg')`
    align-items: center;
    flex-direction: row;
    .tvl {
      margin-left: auto;
      font-size: 16px;
    }
    span {
      font-size: 24px;
    }
  `}
`;

const StyledContent = styled.div`
  display: block;
  ${screenUp('lg')`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 30px;
  `}
`;

export default Pools;
