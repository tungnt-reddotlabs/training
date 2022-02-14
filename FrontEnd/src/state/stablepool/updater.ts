import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '..';
import { getAllPoolConfig, getPoolConfig, getTokenAddress } from '../../config';
import { useGetContract } from '../../providers/ContractProvider';
import { initialLoad, updatePoolConfig, updatePoolInfo } from './actions';
import { useCurrentPoolAssetsSymbol, useWatchedPools } from './hooks';
import { abi as SwapABI } from '../../abis/Swap.json';
import { Call } from '../../hooks/multicall';
import { useMulticall } from '../../hooks/useMulticall';
import { zipObject } from 'lodash';
import { useLastUpdated } from '../application/hooks';
import { useGetErc20 } from '../../hooks/useErc20';
import { useMemo } from 'react';
import { useWatchTokenBalance } from '../user/hooks';

const Updater = () => {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const getContract = useGetContract();
  const getErc20 = useGetErc20();
  const multicall = useMulticall();
  const lastUpdated = useLastUpdated();

  const fetchPoolInfo = useCallback(
    async (poolId: string) => {
      if (!chainId) {
        return;
      }

      const poolConfig = getPoolConfig(chainId, poolId);

      if (!poolConfig) {
        return;
      }

      const poolContract = getContract(SwapABI, poolConfig.address);
      const lpAddress = getTokenAddress(chainId, poolConfig.lpToken);
      const lpToken = getErc20(lpAddress);

      const calls: Call[] = [
        {
          contract: poolContract,
          method: 'getTokenBalances',
        },
        {
          contract: poolContract,
          method: 'getAdminBalances',
        },
        {
          contract: lpToken,
          method: 'totalSupply',
        },
        {
          contract: poolContract,
          method: 'getVirtualPrice',
        },
      ];

      // const virtualPrice = await poolContract.getVirtualPrice().catch(() => null);
      const results = await multicall(calls);
      if (!results) return;

      const [[balances], [adminBalances], [totalSupply], [virtualPrice]] = results;
      if (!balances || !adminBalances || !totalSupply || !virtualPrice) return;
      dispatch(
        updatePoolInfo({
          id: poolId,
          adminBalances: adminBalances?.map((t) => t.toHexString()),
          virtualPrice: virtualPrice?.toHexString(),
          balances: zipObject(
            poolConfig.assets,
            balances?.map((x) => x.toHexString()),
          ),
          totalSupply: totalSupply?.toHexString(),
        }),
      );
    },
    [chainId, dispatch, getContract, getErc20, multicall],
  );

  const fetchPoolConfig = useCallback(
    async (poolId: string) => {
      try {
        if (!chainId) {
          return;
        }
        const poolConfig = getPoolConfig(chainId, poolId);
        const poolContract = getContract(SwapABI, poolConfig.address);

        if (!poolConfig) {
          return;
        }

        const calls: Call[] = [
          {
            contract: poolContract,
            method: 'swapStorage',
          },
          {
            contract: poolContract,
            method: 'getA',
          },
        ];

        const results = await multicall(calls);
        if (!results) return;
        const [swapInfo, [a]] = results;
        if (!swapInfo || !a) {
          return;
        }
        dispatch(
          updatePoolConfig({
            id: poolId,
            fee: swapInfo.fee.toHexString(),
            adminFee: swapInfo.adminFee.toHexString(),
            // withdrawFee: swapInfo.defaultWithdrawFee.toHexString(),
            withdrawFee: '0',
            a: a.toHexString(),
          }),
        );
      } catch (error) {
        console.debug(error);
      }
    },
    [chainId, dispatch, getContract, multicall],
  );

  /** populate all pool from config to state whenever chain is detected */
  useEffect(() => {
    if (!chainId) {
      return;
    }
    const poolsConfig = getAllPoolConfig(chainId);
    if (!poolsConfig) {
      return;
    }
    const pools = Object.entries(poolsConfig).map(([id, item]) => {
      return {
        id,
        name: item?.name,
        ...item,
      };
    });

    dispatch(initialLoad(pools));
  }, [chainId, dispatch]);

  const watchedPool = useWatchedPools();

  /* should occured once when change pool */
  useEffect(() => {
    Promise.all(watchedPool.map(fetchPoolConfig));
  }, [watchedPool, fetchPoolConfig]);

  /* should fetch whenever system request. Consider hoisting up */
  useEffect(() => {
    Promise.all(watchedPool.map(fetchPoolInfo));
  }, [watchedPool, fetchPoolInfo, lastUpdated]);

  const poolAssets = useCurrentPoolAssetsSymbol();
  const currentPool = useSelector((s: AppState) => s.stablepool.currentPool);

  const poolConfig = useMemo(() => {
    return getPoolConfig(chainId, currentPool);
  }, [currentPool, chainId]);

  const watchToken = useWatchTokenBalance();

  useEffect(() => {
    if (poolConfig) {
      watchToken(
        poolConfig?.basePool
          ? [...poolAssets, poolConfig.lpToken, poolConfig?.basePool?.toUpperCase()]
          : [...poolAssets, poolConfig.lpToken],
      );
    }
  }, [poolAssets, watchToken, poolConfig]);

  /* fetch allowance */
  // useEffect(() => {
  //   if (!currentPool || !chainId || !account) {
  //     return;
  //   }

  //   const spender = poolConfig.basePool ? getSwapRouterAddress(chainId) : poolConfig.address;
  //   const allAssets = poolAssets.concat([poolConfig.lpToken]);

  //   const calls = allAssets
  //     .map((t) => getTokenConfig(chainId, t))
  //     .map((t) => {
  //       return {
  //         target: t.address,
  //         signature: 'allowance(address, address) view returns (uint256)',
  //         params: [account, spender],
  //       };
  //     });

  //   multicall(calls).then((res: [BigNumber][]) => {
  //     dispatch(
  //       multipleTokenAllowancesFetched(
  //         spender,
  //         allAssets,
  //         res.map((t) => t[0]?.toHexString()),
  //       ),
  //     );
  //   });
  // }, [account, chainId, currentPool, dispatch, multicall, poolAssets, poolConfig]);

  return null;
};

export default Updater;
