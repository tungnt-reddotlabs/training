import { useWeb3React } from '@web3-react/core';
import { flatten } from 'lodash';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetAllStakingVaultConfig } from '../../hooks/useGetAllStakingVaultConfig';
import { useMulticall } from '../../hooks/useMulticall';
import { useLastUpdated } from '../../state/application/hooks';
import { multipleAllUserStakingVaultFetched } from './actions';

const StakingUserInfoUpdater: React.FC = () => {
  const { account } = useWeb3React();
  const multicall = useMulticall();
  const dispatch = useDispatch();
  const stakingVaults = useGetAllStakingVaultConfig();
  const lastUpdated = useLastUpdated();

  const fetchUserInfo = useCallback(async () => {
    if (!account || !multicall || !stakingVaults?.length) {
      return [];
    }

    const calls = stakingVaults.map((v) => [
      {
        target: v.address,
        signature: 'userInfo(address) returns (uint256 amount)',
        params: [account],
      },
      {
        target: v.address,
        signature: 'getUserReward(address _user) view returns (uint256 pending)',
        params: [account],
      },
    ]);
    const response = await multicall(flatten(calls));
    return calls.map((_, index) => {
      const [[amount], [pendingReward]] = response.slice(2 * index, 2 * (index + 1));
      return {
        amount: amount.toHexString(),
        pendingReward: pendingReward.toHexString(),
      };
    });
  }, [account, multicall, stakingVaults]);

  // useEffect(() => {
  //   fetchUserInfo().then((res) => {
  //     dispatch(multipleAllUserStakingVaultFetched(res));
  //   });
  // }, [dispatch, lastUpdated, fetchUserInfo]);

  return null;
};

export default StakingUserInfoUpdater;
