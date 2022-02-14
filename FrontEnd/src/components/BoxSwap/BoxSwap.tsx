import React from 'react';
import styled from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { useState } from 'react';
import {
  useFromToken,
  useInvertDirection,
  useLastFromToken,
  useSelectFromToken,
  useSelectToToken,
  useSwapConfig,
  useToToken,
} from '../../state/stableswap/hooks';
import { useTokenBalance, useWatchTokenBalance } from '../../state/user/hooks';
import { useCallback } from 'react';
import { useWatchAllPools } from '../../state/stablepool/hooks';
import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { useMemo } from 'react';
import Spacer from '../../components/Spacer';
import { TokenInputWithSelect } from '../../components/TokenInput';
import { useApprove } from '../../hooks/useApprove';
import { Button } from '../../components/Buttons';
import { Zero } from '@ethersproject/constants';
import { useEstimateSwapOutput } from './hooks/useEstimateSwapOutput';
import SwapInfo from './components/SwapInfo';
import { ButtonSwap } from './components/ButtonSwap';
import { useSwapRouter } from '../../hooks/useSwapRouter';
import { useTokenList } from '../../views/Swap/hooks/useTokenList';
import { BigNumberValue } from '../BigNumberValue';
import iconSwap from '../../assets/icons/swap.svg';
import { screenUp } from '../../utils/styles';

type BoxSwapProps = {
  embedded?: boolean;
};

const BoxSwap: React.FC<BoxSwapProps> = ({ embedded }) => {
  const { account } = useWeb3React();
  const fromToken = useFromToken();
  const toToken = useToToken();
  const lastFromToken = useLastFromToken();
  const selectFromToken = useSelectFromToken();
  const selectToToken = useSelectToToken();
  const fromTokenBalance = useTokenBalance(fromToken?.symbol);
  const toTokenBalance = useTokenBalance(toToken?.symbol);
  const invertDirection = useInvertDirection();
  const [inputAmount, setInputAmount] = useState<BigNumber | undefined>(undefined);
  const swapConfig = useSwapConfig();
  const swapRouter = useSwapRouter();
  const assets = useTokenList();
  const watchTokens = useWatchTokenBalance();
  useWatchAllPools();

  useEffect(() => {
    watchTokens(assets);
  }, [assets, watchTokens]);

  const { loading, loadingSubmit, approve, isApproved, approveSubmitted } = useApprove(
    fromToken?.symbol,
    swapConfig?.direction === 'samepool' ? swapConfig?.pool : swapRouter?.address,
  );

  const isShowApproveButton = useMemo(() => {
    if (loading) {
      return false;
    }
    return (account && !isApproved && inputAmount?.gt(Zero)) || approveSubmitted;
  }, [account, approveSubmitted, inputAmount, isApproved, loading]);

  const {
    minOutput: estimateMinReceive,
    output: estimateReceive,
    priceOutputPerInput: estimatePriceInputToOutput,
    priceInputPerOutput: estimatePriceOutputToInput,
    impact,
  } = useEstimateSwapOutput(inputAmount, swapConfig);

  const resetForm = useCallback(() => {
    setInputAmount(undefined);
  }, []);

  useEffect(() => {
    resetForm();
  }, [account, resetForm]);

  useEffect(() => {
    if (!fromToken.decimals || !lastFromToken?.decimals) {
      return;
    }
    if (fromToken.decimals === lastFromToken?.decimals) {
      return;
    } else if (fromToken.decimals > lastFromToken?.decimals) {
      const missingDecimals = fromToken?.decimals - lastFromToken?.decimals;
      setInputAmount((s) => (s && s?.gt(Zero) ? s.mul(10 ** missingDecimals) : undefined));
    } else {
      const missingDecimals = lastFromToken?.decimals - fromToken?.decimals;
      setInputAmount((s) => (s && s?.gt(Zero) ? s.div(10 ** missingDecimals) : undefined));
    }
  }, [fromToken.decimals, lastFromToken?.decimals]);

  const onClickBalance = useCallback(() => {
    setInputAmount(fromTokenBalance);
  }, [fromTokenBalance]);

  return (
    <StyledBox>
      <StyledHeader>
        <span>Swap</span>
      </StyledHeader>
      <InputItem>
        <StyledInputHeader>
          From
          <span>
            Balance:&nbsp;
            <button
              onClick={onClickBalance}
              disabled={!fromTokenBalance || fromTokenBalance?.eq(Zero)}
            >
              <BigNumberValue
                value={fromTokenBalance}
                decimals={fromToken?.decimals}
                fractionDigits={2}
                keepCommas
              />
            </button>
          </span>
        </StyledInputHeader>
        <TokenInputWithSelect
          decimals={fromToken?.decimals}
          symbol={fromToken?.symbol}
          value={inputAmount}
          maxValue={fromTokenBalance}
          onChange={setInputAmount}
          tokens={assets}
          onDropDownItemClick={selectFromToken}
          type="fromToken"
        />
      </InputItem>
      <StyledIconSwap onClick={invertDirection}>
        <img src={iconSwap} />
      </StyledIconSwap>
      <InputItem>
        <StyledInputHeader>
          To
          <span>
            Balance:&nbsp;
            <BigNumberValue
              value={toTokenBalance}
              decimals={toToken?.decimals}
              fractionDigits={2}
              keepCommas
            />
          </span>
        </StyledInputHeader>
        <TokenInputWithSelect
          decimals={toToken?.decimals}
          symbol={toToken?.symbol}
          value={estimateReceive}
          maxValue={toTokenBalance}
          tokens={assets}
          onDropDownItemClick={selectToToken}
          disabled
          type="toToken"
        />
      </InputItem>
      {embedded || (inputAmount && estimateReceive?.gt(Zero)) ? (
        <SwapInfo
          estimateMinReceive={estimateMinReceive}
          estimatePriceInputToOutput={estimatePriceInputToOutput}
          estimatePriceOutputToInput={estimatePriceOutputToInput}
          impact={impact}
          inputAmount={inputAmount}
        />
      ) : null}
      <StyledFooter>
        <StyledButtons>
          {isShowApproveButton && (
            <StyledButtonApprove
              className={loadingSubmit ? 'btn-loading' : ''}
              disabled={loadingSubmit || approveSubmitted}
              onClick={approve}
              approved={isApproved}
            >
              {isApproved ? 'Approved' : 'Approve'}
            </StyledButtonApprove>
          )}
          {isShowApproveButton && <Spacer size="md" />}
          <ButtonSwap
            minOutAmount={estimateMinReceive}
            inAmount={inputAmount}
            onConfirmed={resetForm}
            outAmount={estimateReceive}
          />
        </StyledButtons>
      </StyledFooter>
    </StyledBox>
  );
};

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  span {
    font-size: 32px;
    font-weight: bold;
    color: #070a10;
  }
`;

const StyledBox = styled.div`
  padding: 15px 10px;
  background-color: #ffffff;
  ${screenUp('lg')`
    padding: 18px 30px 30px 30px;
  `}
`;

const InputItem = styled.div`
  flex: 1;
  ${screenUp('lg')`
  `}
`;

const StyledIconSwap = styled.button`
  display: block;
  margin: 18px auto 10px auto;
  img {
    width: 26px;
  }
`;

const StyledInputHeader = styled.div`
  display: flex;
  font-size: 16px;
  font-weight: bold;
  color: #070a10;
  padding-bottom: 12px;
  span {
    margin-left: auto;
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

const StyledFooter = styled.div`
  padding-top: 30px;
  display: flex;
  align-items: center;
`;

const StyledButtons = styled.div`
  flex: 1;
  button {
    width: 100%;
  }
`;

const StyledButtonApprove = styled(Button)<{ approved?: boolean }>`
  background-color: ${({ approved }) => approved && 'rgba(3, 160, 98, 0.1)'};
  color: ${({ approved }) => approved && '#03a062'};
`;

export default BoxSwap;
