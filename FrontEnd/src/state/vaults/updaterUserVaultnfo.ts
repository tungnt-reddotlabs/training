import { useWeb3React } from '@web3-react/core';
import { flatten } from 'lodash';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMulticall } from '../../hooks/useMulticall';
import { useLastUpdated } from '../application/hooks';
import { multipleUserVaulInfoFetched, loadPartnerPoolSuccess } from './actions';
import { useVaultingPoolConfigs } from './hooks';
import { usePartnerVaultConfig } from '../../views/Vaults/hooks/usePartnerVaultConfig';

const VaultUserUpdater: React.FC = () => {
  const { account } = useWeb3React();
  const multicall = useMulticall();
  const dispatch = useDispatch();
  const poolConfigs = useVaultingPoolConfigs();
  const lastUpdated = useLastUpdated();

  const fetchMinichefUserInfo = useCallback(async () => {
    if (!account || !multicall || !poolConfigs?.length) {
      return [];
    }

    const calls = poolConfigs.map((pool) => [
      {
        target: pool?.address,
        signature: 'info() returns (uint256 _balanceInFarm, uint256 _pendingRewards, bool _abandoned, bool _canDeposit, bool _canAbandon)',
      }
    ]);
    const response = await multicall(flatten(calls));
    return response.map(([balance, pendingReward]) => {
      return {
        amount: balance.toHexString(),
        rewardDebt: balance.toHexString(),
        pendingReward: pendingReward.toHexString(),
      };
    });
  }, [account, multicall, poolConfigs]);

  useEffect(() => {
    fetchMinichefUserInfo().then((res) => {
      dispatch(multipleUserVaulInfoFetched(res));
    });
  }, [dispatch, fetchMinichefUserInfo, lastUpdated]);

  const partnerPools = usePartnerVaultConfig();

  useEffect(() => {
    dispatch(loadPartnerPoolSuccess(partnerPools));
  }, [dispatch, partnerPools]);

  return null;
};

export default VaultUserUpdater;
