import { createSelector } from '@reduxjs/toolkit';
import { mapValues } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '..';
import { VaulInfo, UserVaulInfo } from '../../models/Vault';
import { toBigNumber } from '../../utils/numbers';
import { VaulInfoState, UserVaulInfoState } from './reducer';

const deserializeVaulInfo = (state: VaulInfoState): VaulInfo => {
  return {
    totalAllocPoint: toBigNumber(state?.totalAllocPoint),
    allocPoint: toBigNumber(state?.allocPoint),
    rewardPerSecond: toBigNumber(state?.rewardPerSecond),
    accRewardPerShare: toBigNumber(state?.accRewardPerShare),
    lastRewardTime: toBigNumber(state?.lastRewardTime),
    totalStaked: toBigNumber(state?.totalStaked),
  };
};

const deserializerUserInfo = (state: UserVaulInfoState): UserVaulInfo => {
  if (state) {
    return mapValues(state, toBigNumber);
  }
};

export const useVaultingPoolConfigs = () => {
  return useSelector((s: AppState) => s.vaults.poolConfigs);
};

export const useVaultingPoolInfos = () => {
  return useSelector((s: AppState) => s.vaults.poolInfos);
};

export const useVaultingUserInfos = () => {
  return useSelector((s: AppState) => s.vaults.userInfos);
};

const selectVaultingPools = createSelector(
  [
    (s: AppState) => s.vaults.poolConfigs,
    (s: AppState) => s.vaults.poolInfos,
    (s: AppState) => s.vaults.userInfos,
    (s: AppState) => s.vaults.partnerPoolConfigs,
    (s: AppState) => s.vaults.partnerPoolInfos,
  ],
  (poolConfigs, poolInfos, useInfos, partnerPoolConfigs, partnerPoolInfos) => {
    return poolConfigs
      .map((p, index) => {
        return {
          poolConfig: p,
          poolInfo: deserializeVaulInfo(poolInfos[index]) || {},
          userInfo: deserializerUserInfo(useInfos[index]) || {},
          partnerPoolInfo: {},
        };
      })
      .concat(
        (partnerPoolConfigs || []).map((p, index) => {
          return {
            poolConfig: p,
            poolInfo: {},
            userInfo: {},
            partnerPoolInfo: partnerPoolInfos[index],
          };
        }),
      );
  },
);

export const useVaultingPools = () => {
  return useSelector(selectVaultingPools);
};

export const useVaultingPool = (minichef: string, id: number) => {
  const poolConfigs = useSelector((s: AppState) => s.vaults.poolConfigs);
  const poolInfos = useSelector((s: AppState) => s.vaults.poolInfos);
  const userInfos = useSelector((s: AppState) => s.vaults.userInfos);

  return useMemo(() => {
    const index = poolConfigs.findIndex((p) => p?.minichef === minichef && p?.id === id);
    if (index !== -1) {
      return {
        poolInfo: deserializeVaulInfo(poolInfos[index]),
        poolConfig: poolConfigs[index],
        userInfo: deserializerUserInfo(userInfos[index]),
      };
    }
  }, [id, minichef, poolConfigs, poolInfos, userInfos]);
};

export const useVaultingPoolConfig = (minichef: string, id: number) => {
  const poolConfigs = useSelector((s: AppState) => s.vaults.poolConfigs);
  return useMemo(
    () => poolConfigs.find((p) => p?.minichef === minichef && p?.id === id),
    [id, minichef, poolConfigs],
  );
};

const selectPendingRewardVaulCount = createSelector(
  [(s: AppState) => s.vaults.userInfos],
  (info) => {
    return info?.filter((t) => toBigNumber(t.pendingReward).gt(0)).length;
  },
);

export const usePendingRewardVaulCount = () => useSelector(selectPendingRewardVaulCount);
