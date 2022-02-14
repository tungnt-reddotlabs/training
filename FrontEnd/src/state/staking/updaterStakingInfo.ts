import { Zero } from '@ethersproject/constants';
import { useWeb3React } from '@web3-react/core';
import { flatten } from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetAllStakingVaultConfig } from '../../hooks/useGetAllStakingVaultConfig';
import { useMulticall } from '../../hooks/useMulticall';
import { useStartObserveTokens } from '../../state/tokens/hooks';
import { useLastUpdated } from '../application/hooks';
import { initialLoadAllStakingVaultError, multipleAllStakingVaultFetched } from './actions';

const StakingInfoUpdater = () => {
  const { account, chainId } = useWeb3React();
  const multicall = useMulticall();
  const dispatch = useDispatch();
  const stakingVaults = useGetAllStakingVaultConfig();
  const lastUpdated = useLastUpdated();

  useEffect(() => {
    return;
    if (!multicall || !stakingVaults || !stakingVaults.length) {
      return;
    }

    let mounted = true;
    const calls = stakingVaults.map((v) => [
      {
        target: v.address,
        signature: 'maxCap() view returns (uint256)',
        params: [],
      },
      {
        target: v.address,
        signature: 'totalStaked() view returns (uint256)',
        params: [],
      },
      {
        target: v.address,
        signature: 'startLockTime() view returns (uint256)',
        params: [],
      },
      {
        target: v.address,
        signature: 'endLockTime() view returns (uint256)',
        params: [],
      },
      {
        target: v.address,
        signature: 'rewardPerSecond() view returns (uint256)',
        params: [],
      },
      {
        target: v.address,
        signature: 'getTotalReward() view returns (uint256)',
        params: [],
      },
    ]);

    multicall(flatten(calls))
      .then((response) => {
        if (!mounted) {
          return;
        }

        const data = calls.map((_, i) => {
          const [
            [maxCap],
            [totalStaked],
            [startLockTime],
            [endLockTime],
            [rewardPerSecond],
            [totalReward],
          ] = response.slice(6 * i, 6 * (i + 1));

          const duration = endLockTime.toNumber() - startLockTime.toNumber();
          return {
            maxCap: maxCap.toHexString(),
            totalStaked: totalStaked.toHexString(),
            estTotalReward: rewardPerSecond?.mul(duration || Zero).toHexString(),
            totalReward: totalReward.toHexString(),
            startLockTime: startLockTime.toHexString(),
            endLockTime: endLockTime.toHexString(),
            rewardPerSecond: rewardPerSecond.toHexString(),
          };
        });

        dispatch(multipleAllStakingVaultFetched(data));
      })
      .catch((error) => {
        dispatch(
          initialLoadAllStakingVaultError({
            error,
          }),
        );
      });
    return () => {
      mounted = false;
    };
  }, [account, dispatch, multicall, chainId, stakingVaults, lastUpdated]);

  const startObserveTokens = useStartObserveTokens();
  useEffect(() => {
    const tokens = flatten(
      stakingVaults.map((t) => {
        return [t.wantSymbol, t.rewardSymbol];
      }),
    );

    startObserveTokens(tokens);
  }, [stakingVaults, startObserveTokens]);

  return null;
};

export default StakingInfoUpdater;
