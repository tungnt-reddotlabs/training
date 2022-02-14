import React, { useCallback } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { TokenInputWithApprove } from '../../../components/TokenInput/TokenInputWithApprove';
import { useCurrentPool, useCurrentPoolAssets } from '../../../state/stablepool/hooks';
import { useTokenBalance } from '../../../state/user/hooks';
import { useSwapRouter } from '../../../hooks/useSwapRouter';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { Zero } from '@ethersproject/constants';
import { Toggle } from '../../../components/Toggle';

export type TokenInputProps = {
  index: number;
  value: BigNumber;
  onChange: (index: number, value: BigNumber) => void;
  useBasePoolToken?: boolean;
  showLine?: boolean;
  onToggle?: (isToggle: boolean) => void;
};

export const TokenInput: React.FC<TokenInputProps> = ({
  value,
  index,
  onChange: _onChange,
  useBasePoolToken,
  showLine,
  onToggle,
}) => {
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const pool = useCurrentPool();
  const swapRouter = useSwapRouter();
  const { decimals, symbol } = assets[index];
  const balance = useTokenBalance(symbol);

  const onChange = useCallback(
    (v: BigNumber) => {
      _onChange(index, v);
    },
    [_onChange, index],
  );

  const onClickBalance = useCallback(() => {
    onChange(balance);
  }, [balance, onChange]);

  return (
    <StyledContainer>
      <StyledHeader>
        Input {symbol}
        <span>
          Balance:{' '}
          <button onClick={onClickBalance} disabled={!balance || balance?.eq(Zero)}>
            <BigNumberValue fractionDigits={2} decimals={decimals} value={balance} />
          </button>
        </span>
      </StyledHeader>
      <TokenInputWithApprove
        key={symbol}
        value={value}
        onChange={onChange}
        decimals={decimals}
        symbol={symbol}
        maxValue={balance}
        spender={pool?.basePool && !useBasePoolToken ? swapRouter?.address : pool.address}
      />
      {showLine && (
        <StyledLine>
          <div className="plus">
            <i className="fal fa-plus"></i>
          </div>
          <div className="line" />
        </StyledLine>
      )}
      {onToggle && (
        <StyledSelectBasePool>
          <Toggle checked={useBasePoolToken} onChange={onToggle}>
            &nbsp;Use 1S3P
          </Toggle>
        </StyledSelectBasePool>
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin: 15px 0px;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  color: #070a10;
  padding-bottom: 10px;
  span {
    font-size: 14px;
    font-weight: normal;
    color: #555a71;
    button {
      color: #3085b1;
      padding: 0;
      :hover {
        color: #070a10;
      }
    }
  }
`;

const StyledLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  width: 97%;
  margin-left: auto;
  .plus {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 33px;
    height: 33px;
    border: 1px solid #acb7d0;
    border-radius: 100px;
    i {
      color: #acb7d0;
    }
  }
  .line {
    flex: 1;
    margin-left: 10px;
    border-bottom: 1px dashed #acb7d0;
  }
`;

const StyledSelectBasePool = styled.div`
  margin-top: 5px;
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  font-size: 14px;
  font-weight: 500;
  color: #555a71;
`;
