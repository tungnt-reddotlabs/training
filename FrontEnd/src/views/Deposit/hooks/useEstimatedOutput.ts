import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { parseUnits } from '@ethersproject/units';
import { zipObject } from 'lodash';
import { useState, useEffect, useMemo, useCallback } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { usePoolContract } from '../../../hooks/usePoolContract';
import { useSwapRouter } from '../../../hooks/useSwapRouter';
import { useGetSlippagePrecise } from '../../../state/application/hooks';
import { useCurrentPool, useCurrentPoolAssets, usePool } from '../../../state/stablepool/hooks';
import { Precision, SlippagePrecision } from '../../../utils/constants';
import { sum } from '../../../utils/numbers';

export type DepositEstimation = {
  lpAmount: BigNumber;
  poolShare: BigNumber;
  newTotalSupply: BigNumber;
  impact: BigNumber;
  bonus: BigNumber;
};

export const useEstimatedOutput = (
  input: BigNumber[],
  useBasePoolToken?: boolean,
): DepositEstimation => {
  const pool = useCurrentPool();
  const basePool = usePool(pool?.basePool);
  const poolContract = usePoolContract(pool?.address);
  const debouncedAmounts = useDebounce(input, 200);
  const [lpAmount, setLpAmount] = useState<BigNumber>();
  const [impact, setImpact] = useState<BigNumber>();
  const [bonus, setBonus] = useState<BigNumber>();
  const slippage = useGetSlippagePrecise();
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const swapRouter = useSwapRouter();

  const newTotalSupply = useMemo(() => {
    return pool?.totalSupply?.add(lpAmount || Zero);
  }, [lpAmount, pool]);

  const poolShare = useMemo(() => {
    return pool ? lpAmount?.mul(1e6).div(newTotalSupply) : null;
  }, [lpAmount, newTotalSupply, pool]);

  const calculateImpact = useCallback(
    (amounts: BigNumber[], output: BigNumber) => {
      if (!pool || !pool.totalSupply) {
        return;
      }
      const totalInput = assets
        .map((t, i) => amounts[i]?.mul(parseUnits('1', 18 - t.decimals)) || Zero)
        .reduce(sum, Zero);

      if (pool.totalSupply.eq(0)) {
        return {
          output,
          impact: Zero,
          bonus: Zero,
        };
      }

      const totalOutput = output.mul(pool.virtualPrice).div(parseUnits('1', 18));
      const impact = totalInput.gt(totalOutput)
        ? totalInput.sub(totalOutput).mul(Precision).div(totalInput)
        : null;
      const bonus = totalOutput.gt(totalInput)
        ? totalOutput.sub(totalInput).mul(Precision).div(totalInput)
        : null;

      return {
        output,
        impact,
        bonus,
      };
    },
    [pool, assets],
  );

  const estimateMetaPool = useCallback(
    async (debouncedAmounts: BigNumber[]) => {
      if (!basePool) {
        throw Error('No base pool loaded. This may be called by a mistake');
      }

      const amounts = zipObject(
        assets.map((t) => t.symbol),
        debouncedAmounts,
      );
      const output = await swapRouter.calculateTokenAmount(
        pool.address,
        basePool.address,
        pool.assets.map((t) => amounts[t] || Zero),
        basePool.assets.map((t) => amounts[t] || Zero),
        true,
      );

      return calculateImpact(debouncedAmounts, output);
    },
    [assets, basePool, pool, swapRouter, calculateImpact],
  );

  const estimatePlainPool = useCallback(
    async (amounts: BigNumber[]) => {
      amounts = assets.map((t, i) => amounts[i] || Zero); // contracts require all value
      const output = await poolContract?.calculateTokenAmount(amounts, true);

      return calculateImpact(amounts, output);
    },
    [poolContract, calculateImpact, assets],
  );

  const estimate = useCallback(
    async (input: BigNumber[]) => {
      if (input.every((t) => !t || t.eq(0))) {
        return;
      }

      return basePool && !useBasePoolToken
        ? await estimateMetaPool(input)
        : await estimatePlainPool(input);
    },
    [basePool, estimateMetaPool, estimatePlainPool, useBasePoolToken],
  );

  useEffect(() => {
    if (!pool) {
      return;
    }

    let mounted = true;
    estimate(debouncedAmounts)
      .then((res) => {
        if (!mounted) {
          return;
        }

        if (!res) {
          setLpAmount(null);
          setImpact(null);
          setBonus(null);
          return;
        }
        setLpAmount(res.output.mul(SlippagePrecision.sub(slippage)).div(SlippagePrecision));
        setImpact(res.impact);
        setBonus(res.bonus);
      })
      .catch((e) => {
        console.warn(e);
        setLpAmount(null);
        setImpact(null);
        setBonus(null);
      });

    return () => {
      mounted = false;
    };
  }, [debouncedAmounts, estimate, pool, slippage]);

  return {
    lpAmount,
    poolShare,
    newTotalSupply,
    impact,
    bonus,
  };
};
