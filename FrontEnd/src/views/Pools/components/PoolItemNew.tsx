import { parseUnits } from '@ethersproject/units';
import React from 'react';
import { useMemo } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import Spacer from '../../../components/Spacer';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { useToken } from '../../../hooks/useToken';
import { StablePool } from '../../../models/StablePool';
import { screenUp } from '../../../utils/styles';

const PoolItem: React.FC<{ stablePool: StablePool }> = ({ stablePool }) => {
  const { url } = useRouteMatch();
  const lpToken = useToken(stablePool?.lpToken);

  const liquidity = useMemo(() => {
    return stablePool?.totalSupply?.mul(stablePool?.virtualPrice)?.div(parseUnits('1', 18));
  }, [stablePool]);

  return (
    <StyledPool>
      <StyledTokenSymbol>
        <TokenSymbol
          symbol={
            stablePool?.lpToken === '1S3P' ? `${stablePool?.lpToken}_LP` : stablePool?.lpToken
          }
          size={60}
        />
        <div className="content">
          {stablePool?.name}
          <StyledValue>
            TVL:{' '}
            <BigNumberValue
              value={liquidity}
              decimals={lpToken?.decimals}
              fractionDigits={0}
              currency="USD"
            />
          </StyledValue>
        </div>
      </StyledTokenSymbol>
      <StyledButtons>
        <ButtonAdd to={`${url}/${stablePool?.id}/deposit`}>Deposit</ButtonAdd>
        <Spacer />
        <ButtonRemove to={`${url}/${stablePool?.id}/withdraw`}>Withdraw</ButtonRemove>
      </StyledButtons>
    </StyledPool>
  );
};

const StyledPool = styled.div`
  display: flex;
  flex-direction: column;
  padding: 18px;
  background-color: #ffffff;
  :not(:last-child) {
    margin-bottom: 15px;
  }
  ${screenUp('lg')`
     :not(:last-child) {
      margin-bottom: 0px;
    }
  `}
`;

const StyledTokenSymbol = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  img {
    width: 60px;
    object-fit: contain;
  }
  .content {
    margin-left: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #070a10;
  }
  ${screenUp('lg')`
    margin-bottom: 0px;
  `}
`;

const StyledValue = styled.div<{ highlight?: boolean }>`
  padding-top: 4px;
  font-size: 15px;
  font-weight: normal;
  color: ${({ highlight }) => (highlight ? '#03a062' : '#070a10')};
`;

const StyledButtons = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px dashed #2f335a;
  justify-content: center;
  ${screenUp('lg')`
    margin-bottom: 0;
    margin-top: 32px;
    padding-top: 0;
    border-top: none;
  `}
`;

const ButtonRemove = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  height: 36px;
  border: solid 1px #3085b1;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  color: #3085b1;
  :hover {
    color: #fff;
    background-color: #3085b1;
  }
`;

const ButtonAdd = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  height: 36px;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  color: #fff;
  background-color: #3085b1;
`;

export default PoolItem;
