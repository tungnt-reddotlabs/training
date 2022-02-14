import { createSelector } from '@reduxjs/toolkit';
import { mapValues } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '..';
import { StakingInfo, StakingUserInfo, StakingVaultInfo } from '../../models/StakingVault';
import { toBigNumber } from '../../utils/numbers';

const deserializeVaultInfo = (state: StakingInfo): StakingInfo => {
  if (state) {
    return {
      maxCap: toBigNumber(state.maxCap),
      rewardFund: toBigNumber(state.rewardFund),
      totalStaked: toBigNumber(state.totalStaked),
      startLockTime: state.startLockTime,
      endLockTime: state.endLockTime,
      rewardPerSecond: toBigNumber(state.rewardPerSecond),
      totalReward: toBigNumber(state.totalReward),
      estTotalReward: toBigNumber(state.estTotalReward),
    };
  }
};

const deserializerUserInfo = (state: StakingUserInfo): StakingUserInfo => {
  if (state) {
    return mapValues(state, toBigNumber);
  }
};

const selectStakingVaults = createSelector(
  [
    (s: AppState) => s.staking.vaultConfigs,
    (s: AppState) => s.staking.vaultInfos,
    (s: AppState) => s.staking.userInfos,
  ],
  (vaultConfigs, vaultInfos, userInfos) => {
    return vaultConfigs.map((v, index) => {
      return {
        vaultConfig: v,
        vaultInfo: vaultInfos ? deserializeVaultInfo(vaultInfos[index]) : {},
        userInfo: userInfos ? deserializerUserInfo(userInfos[index]) : {},
      };
    });
  },
);

export const useStakingVaults = () => {
  return useSelector(selectStakingVaults);
};

export const useStakingVaultConfigs = () => {
  return useSelector((s: AppState) => s.staking.vaultConfigs);
};

export const useStakingVaultInfos = () => {
  return useSelector((s: AppState) => s.staking.vaultInfos);
};

export const useUserStakingVaultInfos = () => {
  return useSelector((s: AppState) => s.staking.userInfos);
};

export const useStakingVault = (address: string) => {
  const vaultConfigs = useSelector((s: AppState) => s.staking.vaultConfigs);
  const vaultInfos = useSelector((s: AppState) => s.staking.vaultInfos);
  const userInfos = useSelector((s: AppState) => s.staking.userInfos);

  return useMemo(() => {
    const index = vaultConfigs.findIndex((v) => v?.address === address);
    if (index !== -1) {
      return {
        vaultConfig: vaultConfigs ? vaultConfigs[index] : {},
        vaultInfo: vaultInfos ? deserializeVaultInfo(vaultInfos[index]) : {},
        userInfo: userInfos ? deserializerUserInfo(userInfos[index]) : {},
      } as StakingVaultInfo;
    }
  }, [address, userInfos, vaultConfigs, vaultInfos]);
};

export const useStakingVaultConfig = (address: string) => {
  const vaultConfigs = useSelector((s: AppState) => s.staking.vaultConfigs);
  return useMemo(
    () => vaultConfigs.find((v) => v.address === address),
    [address, vaultConfigs],
  );
};
