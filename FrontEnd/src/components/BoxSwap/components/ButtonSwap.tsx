import React, { useCallback, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { useTokenBalance } from '../../../state/user/hooks';
import { useFromToken, useSwapConfig, useToToken } from '../../../state/stableswap/hooks';
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Zero } from '@ethersproject/constants';
import { useGetDeadline } from '../../../state/application/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { formatBigNumber } from '../../../utils/numbers';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import styled from 'styled-components';
import { Button } from '../../../components/Buttons';
import { useApprove } from '../../../hooks/useApprove';
import { ModalSelectWallet } from '../../../components/AccountModal/ModalSelectWallet';
import useModal from '../../../hooks/useModal';
import { useGetPoolContract } from '../../../hooks/usePoolContract';
import { SwapConfig } from '../../../state/stableswap/reducer';
import { useSwapRouter } from '../../../hooks/useSwapRouter';

enum ButtonStatus {
  loadBalance = 0,
  notConnect = 1,
  notApprove = 2,
  notInput = 3,
  insufficientBalance = 4,
  duplicateToken = 5,
  ready = 6,
  inSubmit = 7,
  noRoute,
}

type ButtonSwapProps = {
  inAmount: BigNumber;
  minOutAmount: BigNumber;
  outAmount: BigNumber;
  onConfirmed: () => void;
};

export const ButtonSwap: React.FC<ButtonSwapProps> = ({
  inAmount,
  outAmount,
  minOutAmount,
  onConfirmed,
}) => {
  const { account } = useWeb3React();
  const getDeadline = useGetDeadline();
  const toToken = useToToken();
  const fromToken = useFromToken();
  const fromTokenBalance = useTokenBalance(fromToken?.symbol);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [connect] = useModal(<ModalSelectWallet />);
  const [loading, setLoading] = useState(false);
  const swapConfig = useSwapConfig();
  const getPoolContract = useGetPoolContract();
  const swapRouter = useSwapRouter();
  const { isApproved } = useApprove(
    fromToken?.symbol,
    swapConfig?.direction === 'samepool' ? swapConfig?.pool : swapRouter?.address,
  );

  const status = useMemo(() => {
    if (!account) {
      return ButtonStatus.notConnect;
    }
    if (!swapConfig) {
      return ButtonStatus.noRoute;
    }
    if (!inAmount || inAmount?.eq(Zero)) {
      return ButtonStatus.notInput;
    }
    if (inAmount && fromTokenBalance && inAmount?.gt(fromTokenBalance)) {
      return ButtonStatus.insufficientBalance;
    }
    if (!isApproved) {
      return ButtonStatus.notApprove;
    }
    if (loading) {
      return ButtonStatus.inSubmit;
    }
    if (!fromTokenBalance) {
      return ButtonStatus.loadBalance;
    }

    return ButtonStatus.ready;
  }, [account, fromTokenBalance, inAmount, isApproved, loading, swapConfig]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
      case ButtonStatus.ready:
        return false;
      default:
        return true;
    }
  }, [status]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
        return `Connect wallet`;
      case ButtonStatus.notInput:
        return `Enter ${fromToken?.symbol}  amount`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      case ButtonStatus.noRoute:
        return 'Cannot find route for this swap';
      default:
        return 'Swap';
    }
  }, [fromToken?.symbol, status]);

  const swapToBase = useCallback(
    async (input: BigNumber, swapConfig: SwapConfig, minOutAmount: BigNumber) => {
      if (swapConfig.direction !== 'swapToBase') {
        throw 'Invalid call';
      }

      return await swapRouter.safeCall.swapToBase(
        swapConfig.pool,
        swapConfig.basePool,
        swapConfig.fromIndex,
        swapConfig.toIndex,
        input,
        minOutAmount,
        getDeadline(),
        {},
      );
    },
    [swapRouter, getDeadline],
  );

  const swapFromBase = useCallback(
    async (input: BigNumber, swapConfig: SwapConfig, minOutAmount: BigNumber) => {
      if (swapConfig.direction !== 'swapFromBase') {
        throw 'Invalid call';
      }

      return swapRouter.safeCall.swapFromBase(
        swapConfig.pool,
        swapConfig.basePool,
        swapConfig.fromIndex,
        swapConfig.toIndex,
        input,
        minOutAmount,
        getDeadline(),
        {},
      );
    },
    [swapRouter, getDeadline],
  );

  const swapSamePool = useCallback(
    async (inAmount: BigNumber, swapConfig: SwapConfig, minOutAmount: BigNumber) => {
      if (swapConfig.direction !== 'samepool') {
        throw 'Invalid call';
      }

      const poolContract = getPoolContract(swapConfig.pool);
      return (await poolContract.safeCall.swap(
        swapConfig.fromIndex,
        swapConfig.toIndex,
        inAmount,
        minOutAmount,
        getDeadline(),
        {},
      )) as TransactionResponse;
    },
    [getDeadline, getPoolContract],
  );

  const swap = useCallback(() => {
    switch (swapConfig?.direction) {
      case 'samepool':
        return swapSamePool(inAmount, swapConfig, minOutAmount);
      case 'swapToBase':
        return swapToBase(inAmount, swapConfig, minOutAmount);
      case 'swapFromBase':
        return swapFromBase(inAmount, swapConfig, minOutAmount);
    }
  }, [inAmount, minOutAmount, swapConfig, swapFromBase, swapSamePool, swapToBase]);

  const onSwap = useCallback(async () => {
    if (!inAmount || !minOutAmount) {
      return;
    }
    setLoading(true);
    try {
      const summary = `Swap ${formatBigNumber(inAmount, fromToken.decimals, {
        fractionDigits: 3,
        significantDigits: 1,
        compact: false,
      })} ${fromToken?.symbol} to ${formatBigNumber(outAmount, toToken.decimals, {
        fractionDigits: 3,
        significantDigits: 1,
        compact: false,
      })} ${toToken?.symbol}`;
      const tx = await handleTransactionReceipt(summary, swap);
      if (tx) {
        await tx.wait();
        setLoading(false);
        onConfirmed();
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    fromToken,
    handleTransactionReceipt,
    inAmount,
    minOutAmount,
    onConfirmed,
    swap,
    toToken,
    outAmount,
  ]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notConnect: {
        return connect();
      }
      default:
        return onSwap();
    }
  }, [connect, onSwap, status]);

  return (
    <StyledButton
      className={status === ButtonStatus.inSubmit ? 'btn-loading' : ''}
      onClick={onButtonClick}
      disabled={disabled}
    >
      {buttonText}
    </StyledButton>
  );
};

const StyledButton = styled(Button)``;
