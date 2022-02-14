import { createAction } from '@reduxjs/toolkit';
import { StakingVaultConfig } from '../../config/type';
import { StakingInfo, StakingUserInfo } from '../../models/StakingVault';

export const initialLoadAllStakingVaultsSuccess = createAction<StakingVaultConfig[]>(
  'staking/initialLoad/success',
);

export const initialLoadAllStakingVaultError = createAction<{ error: string }>(
  'staking/initialLoad/error',
);

export const multipleAllStakingVaultFetched = createAction<StakingInfo[]>(
  'staking/multipleAllStakingVaultFetched',
);

export const multipleAllUserStakingVaultFetched = createAction<StakingUserInfo[]>(
  'staking/multipleAllUserStakingVaultFetched',
);
