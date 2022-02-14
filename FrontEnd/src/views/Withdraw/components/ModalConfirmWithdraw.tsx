import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { zipObject } from 'lodash';
import React from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { Button } from '../../../components/Buttons';
import Modal from '../../../components/Modal';
import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalProps,
  ModalTitle,
} from '../../../components/Modal/ModalStyles';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { usePoolContract } from '../../../hooks/usePoolContract';
import { useSwapRouter } from '../../../hooks/useSwapRouter';
import { useGetDeadline, useGetSlippagePrecise } from '../../../state/application/hooks';
import { useCurrentPoolAssets, useCurrentPool, usePool } from '../../../state/stablepool/hooks';
import { useUserToken } from '../../../state/user/hooks';
import { SlippagePrecision } from '../../../utils/constants';
import {
  TwoColumnGrid,
  Label,
  Separator,
  ValueSecondary,
  ModalSwapHeader,
  ModalRow,
  ModalRowTitle,
  ModalRowValue,
} from '../../PoolDetail/components/Share';

export type ModalConfirmWithdrawProps = ModalProps & {
  input: BigNumber;
  singleOutput: boolean;
  outputIndex: number;
  estimatedOutput: BigNumber[];
  onConfirmed: () => void;
  useBasePoolToken?: boolean;
};

export const ModalConfirmWithdraw: React.FC<ModalConfirmWithdrawProps> = ({
  input,
  onDismiss,
  estimatedOutput,
  outputIndex,
  singleOutput,
  onConfirmed,
  useBasePoolToken,
}) => {
  const pool = useCurrentPool();
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const slippage = useGetSlippagePrecise();
  const poolContract = usePoolContract(pool.address);
  const deadline = useGetDeadline();
  const [submitting, setSubmitting] = useState(false);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const withSlippage = useCallback(
    (x: BigNumber) => {
      return x?.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision) || Zero;
    },
    [slippage],
  );
  const lpToken = useUserToken(pool.lpToken);
  const swapRouter = useSwapRouter();
  const basePool = usePool(pool?.basePool);

  const output = useMemo(() => {
    if (singleOutput) {
      return [
        {
          symbol: assets[outputIndex].symbol,
          decimals: assets[outputIndex].decimals,
          value: estimatedOutput[outputIndex],
        },
      ];
    }

    return assets.map((t, i) => {
      return {
        symbol: t.symbol,
        decimals: t.decimals,
        value: estimatedOutput[i],
      };
    });
  }, [assets, estimatedOutput, outputIndex, singleOutput]);

  const removeOneTokenPlain = useCallback(
    async (outputIndex: number, minAmount: BigNumber) => {
      return (await poolContract.safeCall.removeLiquidityOneToken(
        input,
        outputIndex,
        minAmount,
        deadline(),
        {
          gasLimit: 1.5e6,
        },
      )) as TransactionResponse;
    },
    [deadline, input, poolContract],
  );

  const removeAllTokensPlain = useCallback(async () => {
    return (await poolContract.safeCall.removeLiquidity(
      input,
      estimatedOutput.map(withSlippage),
      deadline(),
    )) as TransactionResponse;
  }, [deadline, estimatedOutput, input, poolContract, withSlippage]);

  const removeOneTokenMeta = useCallback(
    async (baseIndex: number, minAmount) => {
      if (!basePool) {
        throw new Error('Invalid call');
      }

      return (await swapRouter.safeCall.removeBaseLiquidityOneToken(
        pool.address,
        basePool.address,
        input,
        baseIndex,
        minAmount,
        deadline(),
        {
          gasLimit: 1.5e6,
        },
      )) as TransactionResponse;
    },
    [basePool, deadline, input, pool, swapRouter],
  );

  const removeAllTokensMeta = useCallback(async () => {
    if (!basePool) {
      throw new Error('Invalid call');
    }

    const amountMap = zipObject(
      assets.map((t) => t.symbol),
      estimatedOutput,
    );
    const minAmounts = pool.assets.map((t) => withSlippage(amountMap[t]));
    const minBaseAmounts = basePool.assets.map((t) => withSlippage(amountMap[t]));
    return (await swapRouter.safeCall.removeLiquidity(
      pool.address,
      basePool.address,
      input,
      minAmounts,
      minBaseAmounts,
      deadline(),
    )) as TransactionResponse;
  }, [assets, basePool, deadline, estimatedOutput, input, pool, swapRouter, withSlippage]);

  const remove = useCallback(() => {
    switch (true) {
      case (useBasePoolToken || !basePool) && singleOutput:
        return removeOneTokenPlain(outputIndex, withSlippage(estimatedOutput[outputIndex]));
      case (useBasePoolToken || !basePool) && !singleOutput:
        return removeAllTokensPlain();
      case !!basePool && !singleOutput:
        return removeAllTokensMeta();
      case !!basePool && singleOutput: {
        const outputSymbol = assets[outputIndex].symbol;
        const baseIndex = basePool.assets.indexOf(outputSymbol);
        if (baseIndex >= 0) {
          return removeOneTokenMeta(baseIndex, withSlippage(estimatedOutput[outputIndex]));
        } else {
          const metaIndex = pool.assets.indexOf(outputSymbol);
          return removeOneTokenPlain(metaIndex, withSlippage(estimatedOutput[outputIndex]));
        }
      }
    }
  }, [
    assets,
    basePool,
    estimatedOutput,
    outputIndex,
    pool.assets,
    removeAllTokensMeta,
    removeAllTokensPlain,
    removeOneTokenMeta,
    removeOneTokenPlain,
    singleOutput,
    useBasePoolToken,
    withSlippage,
  ]);

  const onConfirm = useCallback(() => {
    setSubmitting(true);
    const summary = `Withdraw from ${pool?.lpToken} pool`;
    handleTransactionReceipt(summary, remove)
      .then(() => {
        setSubmitting(false);
        onConfirmed();
        onDismiss();
      })
      .catch((e) => {
        setSubmitting(false);
        console.warn(e);
      });
  }, [handleTransactionReceipt, onConfirmed, onDismiss, pool?.lpToken, remove]);

  return (
    <Modal size="sm">
      <ModalSwapHeader>
        <ModalCloseButton onClick={onDismiss} />
        <ModalTitle>Confirm Withdraw</ModalTitle>
      </ModalSwapHeader>
      <ModalContent>
        <div>
          <ModalRow>
            <ModalRowTitle>Redeem</ModalRowTitle>
            <ModalRowValue variant="success">
              <BigNumberValue value={input} decimals={lpToken.decimals} />
            </ModalRowValue>
            &nbsp;
            {pool?.lpToken}
            <TokenSymbol symbol={pool.lpToken} />
          </ModalRow>
        </div>
        <Separator />
        <div>
          {output.map((t, index) => (
            <ModalRow key={index}>
              {index === 0 ? <ModalRowTitle>Receive</ModalRowTitle> : null}
              <ModalRowValue>
                <BigNumberValue value={t.value} decimals={t.decimals} />
                &nbsp;
                {t?.symbol}
              </ModalRowValue>
              <TokenSymbol symbol={t?.symbol} size={24} />
            </ModalRow>
          ))}
        </div>
        <Separator />
        <TwoColumnGrid>
          <Label>Slippage</Label>
          <ValueSecondary>
            <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} />
          </ValueSecondary>
        </TwoColumnGrid>
      </ModalContent>
      <ModalFooter>
        <Button
          className={submitting ? 'btn-loading' : ''}
          disabled={submitting}
          block
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
  );
};
