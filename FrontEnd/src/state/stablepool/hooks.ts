import { BigNumber } from '@ethersproject/bignumber';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '..';
import { getAllPoolConfig, getPoolConfig, getTokenConfig } from '../../config';
import { toBigNumber } from '../../utils/numbers';
import { useWatchTokenBalance } from '../user/hooks';
import { enterPool, watchPools } from './actions';
import { deserializePool, selectors } from './poolList';

export const useEnterPool = () => {
  const dispatch = useDispatch();
  const { chainId } = useWeb3React();
  return useCallback(
    (id) => {
      if (!chainId) {
        return;
      }
      const poolConfig = getPoolConfig(chainId, id);

      if (!poolConfig) {
        return;
      }
      dispatch(enterPool(id));
      if (poolConfig.basePool) {
        dispatch(watchPools([id, poolConfig.basePool]));
      } else {
        dispatch(watchPools([id]));
      }
    },
    [chainId, dispatch],
  );
};

/* read static info from config to reduce state change */
export const useCurrentPoolAssetsSymbol = () => {
  const currentPool = useSelector((state: AppState) => state.stablepool.currentPool);
  const { chainId } = useWeb3React();

  return useMemo(() => {
    const pool = getPoolConfig(chainId, currentPool);
    if (!pool) {
      return [];
    }
    const basePool = getPoolConfig(chainId, pool.basePool);
    const baseAssets = basePool?.assets || [];

    return [...pool?.assets, ...baseAssets].filter((t) => t !== basePool?.lpToken);
  }, [chainId, currentPool]);
};

export const usePool = (id: string) => {
  return useSelector((state: AppState) => selectors.selectById(state, id));
};

export const useCurrentPoolAssets = (useBasePoolToken?: boolean) => {
  const pools = useSelector((s: AppState) => s.stablepool.pools);
  const currentPoolId = useSelector((s: AppState) => s.stablepool.currentPool);
  const { chainId } = useWeb3React();
  const walletBalances = useSelector((t: AppState) => t.user.balances);

  return useMemo(() => {
    const currentPool = pools.entities[currentPoolId];
    if (!currentPool) {
      return [];
    }

    const basePool = pools.entities[currentPool.basePool];

    const assets = useBasePoolToken
      ? [...currentPool.assets]
      : [...currentPool.assets, ...(basePool?.assets || [])].filter(
          (t) => t !== basePool?.lpToken,
        );
    return assets.map((t) => {
      const config = getTokenConfig(chainId, t);
      let poolBalance: BigNumber;

      if (currentPool.balances) {
        poolBalance = currentPool.balances ? toBigNumber(currentPool.balances[t]) : null;
        if (!poolBalance && basePool && basePool.balances) {
          poolBalance = basePool.balances[t]
            ? toBigNumber(basePool.balances[t])
                .mul(currentPool.balances[basePool.lpToken])
                .div(basePool.totalSupply)
            : null;
        }
      }

      return {
        ...config,
        symbol: t,
        balance: toBigNumber(walletBalances[t]),
        poolBalance: poolBalance,
      };
    });
  }, [chainId, currentPoolId, pools.entities, useBasePoolToken, walletBalances]);
};

export const useCurrentPoolLiquidity = () => {
  const pools = useSelector((s: AppState) => s.stablepool.pools);
  const currentPoolId = useSelector((s: AppState) => s.stablepool.currentPool);
  const { chainId } = useWeb3React();

  return useMemo(() => {
    const currentPool = pools.entities[currentPoolId];
    if (!currentPool || !chainId) {
      return [];
    }

    return currentPool?.assets.map((t) => {
      const config = getTokenConfig(chainId, t);
      let poolBalance: BigNumber;

      if (currentPool.balances) {
        poolBalance = currentPool.balances ? toBigNumber(currentPool.balances[t]) : null;
      }

      return {
        ...config,
        symbol: t,
        poolBalance: poolBalance,
      };
    });
  }, [chainId, currentPoolId, pools.entities]);
};

export const useStablePool = () => {
  return useSelector((t: AppState) => t.stablepool);
};

export const useCurrentPool = () => {
  const currentPoolId = useSelector((s: AppState) => s.stablepool.currentPool);
  const pool = useSelector((s: AppState) => selectors.selectById(s, currentPoolId));
  return useMemo(() => {
    return deserializePool(pool);
  }, [pool]);
};

export const useWatchedPools = () => {
  return useSelector((s: AppState) => s.stablepool.watchedPools);
};

export const useAllPools = () => {
  const allPool = useSelector(selectors.selectAll);

  return useMemo(() => {
    return allPool.map(deserializePool);
  }, [allPool]);
};

export const useWatchAllPools = () => {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch();
  const watchToken = useWatchTokenBalance();

  useEffect(() => {
    if (!chainId) {
      return;
    }
    const allPoolIds = getAllPoolConfig(chainId);
    dispatch(watchPools(Object.keys(allPoolIds)));
    const poolLps = Object.values(allPoolIds).map((t) => t.lpToken);
    watchToken(poolLps);

    return () => {
      dispatch(watchPools([]));
    };
  }, [chainId, dispatch, watchToken]);
};

export const useAllPoolConfig = () => {
  const { chainId } = useWeb3React();
  return useMemo(() => {
    if (!chainId) {
      return [];
    }
    const pools = getAllPoolConfig(chainId) || [];
    return Object.entries(pools).map(([id, config]) => {
      return {
        id,
        ...config,
      };
    });
  }, [chainId]);
};

type TokenPoolMap = Record<
  string,
  {
    pool: string;
    poolAddress;
    basePool?: string;
    index: number;
  }
>;
/**
 *
 * @returns map from token to its pool and index in pool
 */
export const useTokenPool = () => {
  const allPool = useAllPoolConfig();
  return useMemo(() => {
    return allPool.reduce((acc, item) => {
      item.assets.forEach((t, index) => {
        acc[t] = {
          pool: item.id,
          poolAddress: item.address,
          basePool: item.basePool,
          index,
        };
      });

      return acc;
    }, {} as TokenPoolMap);
  }, [allPool]);
};

export const usePoolsSwapFee = () => {
  const pools = useSelector((s: AppState) => s.stablepool.pools.entities);

  return useMemo(
    () =>
      Object.entries(pools).reduce((acc, [, item]) => {
        return {
          ...acc,
          [item.address]: toBigNumber(item.fee),
        };
      }, {} as Record<string, BigNumber>),
    [pools],
  );
};
