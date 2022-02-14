import { BigNumber } from '@ethersproject/bignumber';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { TokenSymbol } from '../TokenSymbol';
import { TokenInputWithMaxButton } from './TokenInputWithMaxButton';
import { DropdownSelectToken } from '../DropdownSelectToken';
import ReactSlider from '../ReactSlider';
import { Zero } from '@ethersproject/constants';
import { screenUp } from '../../utils/styles';

export type TokenInputWithSelectProps = {
  maxValue?: BigNumber;
  decimals: number;
  symbol: string;
  value?: BigNumber | undefined;
  onChange?: (v: BigNumber) => void;
  disabled?: boolean;
  tokens?: string[];
  onDropDownItemClick?: (token: string) => void;
  type?: 'fromToken' | 'toToken' | 'normal';
  hideMaxButton?: boolean;
  showSlider?: boolean;
};

export const TokenInputWithSelect: React.FC<TokenInputWithSelectProps> = ({
  maxValue,
  decimals,
  symbol,
  value,
  onChange,
  disabled,
  tokens,
  onDropDownItemClick,
  type = 'normal',
  hideMaxButton,
  showSlider,
}) => {
  const sliderValue = useMemo(() => {
    if (!maxValue || maxValue?.eq(Zero)) {
      return 0;
    }
    return value?.mul(1e6)?.div(maxValue)?.div(1e4)?.toNumber() || 0;
  }, [maxValue, value]);

  const onSliderChange = useCallback(
    (ratio: number) => {
      if (maxValue && onChange) {
        const value = maxValue.mul(ratio).div(100);
        onChange(value);
      }
    },
    [maxValue, onChange],
  );

  return (
    <div>
      <StyledContainer>
        <StyledHeader>
          <StyledTokenInfo>
            {tokens?.length ? (
              <DropdownSelectToken tokens={tokens} onSelect={onDropDownItemClick} type={type}>
                <StyledToken>
                  <TokenSymbol symbol={symbol} size={36} />
                  <div className="info">
                    <div className="symbol">
                      {symbol}
                      <i className="far fa-angle-down" />
                    </div>
                  </div>
                </StyledToken>
              </DropdownSelectToken>
            ) : (
              <StyledToken>
                <TokenSymbol symbol={symbol} size={36} />
                <div className="info">
                  <div className="symbol">{symbol}</div>
                </div>
              </StyledToken>
            )}
          </StyledTokenInfo>
        </StyledHeader>
        <TokenInputWithMaxButton
          value={value}
          onChange={onChange}
          decimals={decimals}
          symbol={symbol}
          maxValue={maxValue}
          disabled={disabled}
          size="lg"
          hideMaxButton={hideMaxButton}
        />
      </StyledContainer>
      {showSlider && <ReactSlider onChange={onSliderChange} value={sliderValue} />}
    </div>
  );
};

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  width: 45%;
  margin-bottom: 0;
  margin-right: 10px;
  border-right: 1px solid #ffffff;
  background-color: #dde0ea;
  padding: 0 10px 0 10px;
  height: 62px;
  ${screenUp('lg')`
    padding: 0 0 0 15px;
    width: 35%;
  `}
`;

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 3px;
  background-color: #e5e7ef;
`;

const StyledTokenInfo = styled.div`
  display: flex;
  align-items: center;
`;

const StyledToken = styled.button`
  display: flex;
  align-items: center;
  padding: 0px;
  width: 100%;
  img {
    width: 28px;
    height: 28px;
  }
  .info {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 3px 0px;
    font-size: 16px;
    font-weight: normal;
    color: #070a10;
    margin-left: 8px;
    flex-direction: column;
    align-items: flex-start;
    .symbol {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
      i {
        color: #6e7489;
        margin-left: 5px;
      }
    }
  }
  :hover {
    .symbol {
      color: #3085b1;
    }
  }
  ${screenUp('lg')`
    img {
      width: 36px;
      height: 36px;
    }
    .info {
      .symbol {
        font-size: 18px;
      }
    }
  `}
`;
