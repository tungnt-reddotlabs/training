import { BigNumber } from '@ethersproject/bignumber';
import React, { useCallback, useState } from 'react';
import { Button } from '../../../components/Buttons/Button';
import { useCurrentPool, useCurrentPoolAssets, usePool } from '../../../state/stablepool/hooks';
import { abi as PoolAbi } from '../../../abis/Swap.json';
import { useContract } from '../../../hooks/useContract';
import { Zero } from '@ethersproject/constants';
import { useGetDeadline } from '../../../state/application/hooks';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { formatBigNumber } from '../../../utils/numbers';
import { useSwapRouter } from '../../../hooks/useSwapRouter';
import { zipObject } from 'lodash';
import { useMemo } from 'react';

export type ButtonDepositProps = {
  amounts: BigNumber[];
  minOutput: BigNumber;
  onSubmit: () => void;
  useBasePoolToken?: boolean;
};

export const ButtonDeposit: React.FC<ButtonDepositProps> = ({
  amounts,
  minOutput,
  onSubmit,
  useBasePoolToken,
}) => {
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const [loading, setLoading] = useState(false);
  const pool = useCurrentPool();
  const poolContract = useContract(PoolAbi, pool?.address);
  const getDeadline = useGetDeadline();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const swapRouter = useSwapRouter();
  const basePool = usePool(pool?.basePool);

  const depositMetaPool = useCallback(
    (amounts: BigNumber[], minOutput: BigNumber) => {
      if (!basePool) {
        throw Error('This function is called by a mistake');
      }

      const amountsMap = zipObject(
        assets.map((t) => t.symbol),
        amounts,
      );
      return swapRouter.safeCall.addLiquidity(
        pool.address,
        basePool.address,
        pool.assets.map((t) => amountsMap[t] || Zero),
        basePool.assets.map((t) => amountsMap[t] || Zero),
        minOutput || Zero,
        getDeadline(),
      );
    },
    [assets, basePool, pool, swapRouter, getDeadline],
  );

  const depositPlainPool = useCallback(
    (amounts: BigNumber[], minOutput: BigNumber) => {
      const _amounts = assets.map((t, i) => amounts[i] || Zero);
      return poolContract.safeCall.addLiquidity(_amounts, minOutput || Zero, getDeadline());
    },
    [assets, getDeadline, poolContract],
  );

  const deposit = useCallback(async () => {
    setLoading(true);
    const summary = [
      'Deposit',
      assets
        .map((t, i) =>
          amounts[i]
            ? formatBigNumber(amounts[i], t.decimals, { fractionDigits: 2, compact: false }) +
              ' ' +
              t.symbol
            : '',
        )
        .filter((t) => !!t)
        .join(' + '),
    ].join(' ');

    try {
      const handle = basePool && !useBasePoolToken ? depositMetaPool : depositPlainPool;
      await handleTransactionReceipt(summary, () => handle(amounts, minOutput));
      onSubmit?.call(null);
    } catch {
      setLoading(false);
    }
  }, [
    amounts,
    assets,
    basePool,
    depositMetaPool,
    depositPlainPool,
    handleTransactionReceipt,
    minOutput,
    onSubmit,
    useBasePoolToken,
  ]);

  const disabled = useMemo(() => {
    if (!pool?.totalSupply || pool.totalSupply.eq(0)) {
      return loading;
    }
    return loading || !minOutput;
  }, [loading, minOutput, pool]);

  return (
    <Button
      className={loading ? 'btn-loading' : ''}
      block
      onClick={deposit}
      disabled={disabled}
    >
      Confirm
    </Button>
  );
};
