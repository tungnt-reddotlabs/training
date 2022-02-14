import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { useCallback, useEffect, useState } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import useInterval from '../../../hooks/useInterval';
import { useGetPoolContract } from '../../../hooks/usePoolContract';
import { useSwapRouter } from '../../../hooks/useSwapRouter';
import { useGetSlippagePrecise } from '../../../state/application/hooks';
import { usePoolsSwapFee } from '../../../state/stablepool/hooks';
import { useFromToken, useToToken } from '../../../state/stableswap/hooks';
import { SwapConfig } from '../../../state/stableswap/reducer';
import { FeePrecision, PriceUpdateInterval, SlippagePrecision } from '../../../utils/constants';

type EstimateOutput = {
  output: BigNumber;
  minOutput: BigNumber;
  priceInputPerOutput: BigNumber;
  priceOutputPerInput: BigNumber;
  impact: BigNumber;
};

export const useEstimateSwapOutput = (input: BigNumber, swapConfig: SwapConfig) => {
  const getPoolContract = useGetPoolContract();
  const swapRouter = useSwapRouter();
  const debouncedInput = useDebounce(input, 200);
  const fromToken = useFromToken();
  const toToken = useToToken();
  const slippage = useGetSlippagePrecise();
  const swapFees = usePoolsSwapFee();
  const [lastRefresh, setLastRefresh] = useState(0);
  const [output, setOutput] = useState({} as EstimateOutput);

  const reset = useCallback(() => {
    setOutput({} as EstimateOutput);
  }, []);

  useEffect(() => {
    reset();
  }, [input, reset, toToken]);

  const estimateSwapSamePool = useCallback(
    async (input: BigNumber, swapConfig: SwapConfig) => {
      if (swapConfig.direction !== 'samepool') {
        return [];
      }

      const pool = getPoolContract(swapConfig.pool);
      const fee = swapFees[swapConfig.pool];

      const output = await pool.calculateSwap(swapConfig.fromIndex, swapConfig.toIndex, input);
      return [output, fee];
    },
    [getPoolContract, swapFees],
  );

  const estimateSwapToBase = useCallback(
    async (input: BigNumber, swapConfig: SwapConfig) => {
      if (swapConfig.direction !== 'swapToBase') {
        return [];
      }

      const output = await swapRouter.calculateSwapToBase(
        swapConfig.pool,
        swapConfig.basePool,
        swapConfig.fromIndex,
        swapConfig.toIndex,
        input,
      );
      const fee = swapFees[swapConfig.basePool];

      return [output, fee];
    },
    [swapRouter, swapFees],
  );

  const estimateSwapFromBase = useCallback(
    async (input: BigNumber, swapConfig: SwapConfig) => {
      if (swapConfig.direction !== 'swapFromBase') {
        return [];
      }
      const fee = swapFees[swapConfig.pool];

      const output = await swapRouter.calculateSwapFromBase(
        swapConfig.pool,
        swapConfig.basePool,
        swapConfig.fromIndex,
        swapConfig.toIndex,
        input,
      );

      return [output, fee];
    },
    [swapRouter, swapFees],
  );

  const estimate = useCallback(() => {
    switch (swapConfig?.direction) {
      case 'samepool':
        return estimateSwapSamePool(debouncedInput, swapConfig);
      case 'swapToBase':
        return estimateSwapToBase(debouncedInput, swapConfig);
      case 'swapFromBase':
        return estimateSwapFromBase(debouncedInput, swapConfig);
    }
  }, [
    debouncedInput,
    estimateSwapFromBase,
    estimateSwapSamePool,
    estimateSwapToBase,
    swapConfig,
  ]);

  useEffect(() => {
    if (!debouncedInput || debouncedInput?.eq(0) || !swapConfig) {
      reset();
      return;
    }

    let mounted = true;
    estimate().then(([estimatedOutput, fee]) => {
      if (!mounted) {
        return;
      }

      if (!estimatedOutput || estimatedOutput.eq(0)) {
        setOutput({} as EstimateOutput);
        return;
      }

      const estimatedMinAmount = estimatedOutput
        .mul(FeePrecision.sub(fee))
        .mul(SlippagePrecision.sub(slippage))
        .div(SlippagePrecision)
        .div(FeePrecision);

      const commonDecimals = Math.max(fromToken.decimals, toToken.decimals) + 6;
      const priceInputPerOutput = debouncedInput
        .mul(parseUnits('1', commonDecimals - fromToken.decimals))
        .div(estimatedOutput)
        .div(parseUnits('1', commonDecimals - toToken.decimals - 6));
      const priceOutputPerInput = estimatedOutput
        .mul(parseUnits('1', commonDecimals - toToken.decimals))
        .div(debouncedInput)
        .div(parseUnits('1', commonDecimals - fromToken.decimals - 6));

      const basePrice = BigNumber.from(1e6);
      const impact = priceOutputPerInput.lt(basePrice)
        ? basePrice.sub(priceOutputPerInput)
        : null;

      setOutput({
        output: estimatedOutput,
        minOutput: estimatedMinAmount,
        priceInputPerOutput,
        priceOutputPerInput,
        impact,
      });
    });

    return () => {
      mounted = false;
    };
  }, [debouncedInput, estimate, fromToken, reset, slippage, swapConfig, toToken, lastRefresh]);

  useInterval(() => {
    setLastRefresh(Date.now());
  }, PriceUpdateInterval * 1000);

  return output;
};
