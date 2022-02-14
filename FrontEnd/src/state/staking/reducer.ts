import { createReducer } from '@reduxjs/toolkit';
import { StakingVaultConfig } from '../../config/type';
import { StakingInfo, StakingUserInfo } from '../../models/StakingVault';
import {
  initialLoadAllStakingVaultsSuccess,
  initialLoadAllStakingVaultError,
  multipleAllStakingVaultFetched,
  multipleAllUserStakingVaultFetched,
} from './actions';

export type State = {
  loading: boolean;
  loadError?: string;
  vaultConfigs?: StakingVaultConfig[];
  vaultInfos?: StakingInfo[];
  userInfos?: StakingUserInfo[];
};

export const initialState = {
  loading: true,
  loadError: undefined,
} as State;

export default createReducer(initialState, (builder) => {
  builder.addCase(initialLoadAllStakingVaultsSuccess, (state, { payload }) => {
    state.loading = false;
    state.loadError = undefined;
    state.vaultConfigs = payload;
  });

  builder.addCase(initialLoadAllStakingVaultError, (state, action) => {
    return {
      ...state,
      loading: false,
      loadError: action.payload.error,
    } as State;
  });

  builder.addCase(multipleAllStakingVaultFetched, (state, { payload }) => {
    state.vaultInfos = payload;
  });

  builder.addCase(multipleAllUserStakingVaultFetched, (state, { payload }) => {
    state.userInfos = payload;
  });
});
