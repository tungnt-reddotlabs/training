import { BigNumberish } from '@ethersproject/bignumber';
import { createReducer } from '@reduxjs/toolkit';
import { VaulPoolConfig, PartnerVaulInfo } from '../../models/Vault';
import {
  initialLoadVaultingPoolsSuccess,
  initialLoadVaultingPoolsError,
  multipleUserVaulInfoFetched,
  multipleVaulInfoFetched,
  multiplePartnerVaulInfoFetched,
  loadPartnerPoolSuccess,
} from './actions';

export type VaulInfoState = {
  totalAllocPoint: BigNumberish;
  allocPoint: BigNumberish;
  rewardPerSecond: BigNumberish;
  accRewardPerShare: BigNumberish;
  lastRewardTime: BigNumberish;
  totalStaked: BigNumberish;
};

export type UserVaulInfoState = {
  amount?: BigNumberish;
  rewardDebt?: BigNumberish;
  pendingReward?: BigNumberish;
};

type State = {
  loading: boolean;
  loadError?: string;
  poolConfigs: VaulPoolConfig[];
  poolInfos: VaulInfoState[];
  userInfos: UserVaulInfoState[];
  partnerPoolConfigs: VaulPoolConfig[];
  partnerPoolInfos: PartnerVaulInfo[];
};

export const initialState = {
  poolConfigs: [],
  poolInfos: [],
  userInfos: [],
  partnerPoolConfigs: [],
  partnerPoolInfos: [],
} as State;

export default createReducer(initialState, (builder) => {
  builder.addCase(initialLoadVaultingPoolsSuccess, (state, { payload }) => {
    state.loading = false;
    state.loadError = undefined;
    state.poolConfigs = payload;
  });

  builder.addCase(initialLoadVaultingPoolsError, (state, action) => {
    return {
      ...state,
      loading: false,
      loadError: action.payload.error,
    } as State;
  });

  builder.addCase(multipleUserVaulInfoFetched, (state, { payload }) => {
    state.userInfos = payload;
  });

  builder.addCase(multipleVaulInfoFetched, (state, { payload }) => {
    state.poolInfos = payload;
  });

  builder.addCase(loadPartnerPoolSuccess, (state, { payload }) => {
    state.partnerPoolConfigs = payload;
  });

  builder.addCase(multiplePartnerVaulInfoFetched, (state, { payload }) => {
    state.partnerPoolInfos = payload;
  });
});
