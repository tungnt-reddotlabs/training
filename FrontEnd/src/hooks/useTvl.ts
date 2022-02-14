import { Zero } from '@ethersproject/constants';
import { parseUnits } from '@ethersproject/units';
import { useMemo } from 'react';
import { useFarmingPools } from '../state/farms/hooks';
import { useAllPools, useWatchAllPools } from '../state/stablepool/hooks';
import { useTokens } from '../state/tokens/hooks';
import { PricePrecision } from '../utils/constants';

export const useTvl = () => {
  useWatchAllPools();
  const pools = useAllPools();
  const farmingPools = useFarmingPools();
  const tokens = useTokens();

  const totalPoolTvl = useMemo(() => {
    return pools.reduce((acc, pool) => {
      return pool?.totalSupply && pool?.virtualPrice
        ? acc.add(pool?.totalSupply?.mul(pool?.virtualPrice)?.div(parseUnits('1', 18))) || Zero
        : acc;
    }, Zero);
  }, [pools]);

  const totalFarmingPoolTvl = useMemo(() => {
    return farmingPools.reduce((acc, pool) => {
      const wantPrice = tokens?.priceInUsd[pool?.poolConfig?.wantSymbol];
      return pool?.poolInfo?.totalStaked && wantPrice && pool?.poolConfig?.market !== '1Swap'
        ? acc?.add(pool?.poolInfo?.totalStaked?.mul(wantPrice)?.div(PricePrecision)) || Zero
        : acc;
    }, Zero);
  }, [farmingPools, tokens.priceInUsd]);

  return useMemo(() => {
    return totalPoolTvl?.add(totalFarmingPoolTvl);
  }, [totalFarmingPoolTvl, totalPoolTvl]);
};
