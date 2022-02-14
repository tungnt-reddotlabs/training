import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useFromToken, useToToken } from '../../../state/stableswap/hooks';
import { BigNumber } from '@ethersproject/bignumber';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { Zero } from '@ethersproject/constants';
import { SlippageSetting } from '../../SlippageSetting/SlippageSetting';
import { screenUp } from '../../../utils/styles';

const SwapInfo: React.FC<{
  estimateMinReceive: BigNumber;
  estimatePriceInputToOutput: BigNumber;
  estimatePriceOutputToInput: BigNumber;
  impact: BigNumber;
  inputAmount: BigNumber;
}> = ({
  estimateMinReceive,
  estimatePriceInputToOutput,
  estimatePriceOutputToInput,
  // impact,
  inputAmount,
}) => {
  const fromToken = useFromToken();
  const toToken = useToToken();

  const [changePriceDirection, setChangPriceDirection] = useState(false);

  const onChangePriceDirection = useCallback(() => {
    setChangPriceDirection((state) => !state);
  }, []);

  return (
    <StyledContainer>
      <div className="item">
        <div className="label">Price (including fees)</div>
        {inputAmount?.gt(Zero) && !estimatePriceOutputToInput ? (
          <i className="far fa-circle-notch fa-spin" />
        ) : (
          <span>
            {changePriceDirection ? (
              estimatePriceOutputToInput ? (
                <>
                  1 {toToken.symbol} ={' '}
                  <BigNumberValue
                    value={estimatePriceOutputToInput}
                    decimals={6}
                    fractionDigits={6}
                  />
                  &nbsp;{fromToken.symbol}
                </>
              ) : (
                '-'
              )
            ) : estimatePriceInputToOutput ? (
              <>
                1 {fromToken?.symbol} ={' '}
                <BigNumberValue
                  value={estimatePriceInputToOutput}
                  decimals={6}
                  fractionDigits={6}
                />
                &nbsp;{toToken?.symbol}
              </>
            ) : (
              '-'
            )}
            {estimatePriceOutputToInput || estimatePriceInputToOutput ? (
              <button className="reload" onClick={onChangePriceDirection}>
                <i className="far fa-sync" />
              </button>
            ) : null}
          </span>
        )}
      </div>
      <div className="item">
        Minimum received{' '}
        {inputAmount?.gt(Zero) && !estimateMinReceive ? (
          <i className="far fa-circle-notch fa-spin" />
        ) : (
          <span>
            <BigNumberValue
              value={estimateMinReceive}
              decimals={toToken?.decimals}
              fractionDigits={6}
            />
            {estimateMinReceive && <>&nbsp;{toToken?.symbol}</>}
          </span>
        )}
      </div>
      <div className="item">
        Slippage{' '}
        <span>
          <SlippageSetting />
        </span>
      </div>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin: 28px 0 0 0;
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: normal;
    color: ${({ theme }) => theme.colors.text.secondary};
    .label {
      display: flex;
      align-items: center;
    }
    span {
      font-size: 13px;
      font-weight: normal;
      color: ${({ theme }) => theme.colors.text.primary};
      .reload {
        color: ${({ theme }) => theme.colors.primary};
      }
      .note {
        color: ${({ theme }) => theme.colors.primary};
      }
    }
    i {
      font-size: 12px;
    }
    :not(:last-child) {
      margin-bottom: 15px;
    }
  }

  p {
    margin-top: 0;
    margin-bottom: 0;
  }

  .item.danger {
    span {
      color: ${({ theme }) => theme.colors.danger};
    }
  }
  ${screenUp('lg')`
    .item {
      font-size: 16px;
      span {
        font-size: 16px;
      }
      i {
        font-size: 14px;
      }
    }
  `}
`;

export default SwapInfo;
