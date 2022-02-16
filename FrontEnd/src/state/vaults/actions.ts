import { createAction } from '@reduxjs/toolkit';
import { VaulPoolConfig, PartnerVaulInfo } from '../../models/Vault';
import { VaulInfoState, UserVaulInfoState } from './reducer';

export const initialLoadVaultingPoolsSuccess = createAction<VaulPoolConfig[]>(
  'vaults/initialLoad/success',
);

export const initialLoadVaultingPoolsError = createAction<{ error: string }>(
  'vaults/initialLoad/error',
);

export const multipleVaulInfoFetched = createAction<VaulInfoState[]>(
  'vaults/multipleVaulInfoFetched',
);

export const multipleUserVaulInfoFetched = createAction<UserVaulInfoState[]>(
  'vaults/multipleUserVaulInfoFetched',
);

export const loadPartnerPoolSuccess = createAction<VaulPoolConfig[]>(
  'vaults/loadPartnerPoolSuccess',
);

export const multiplePartnerVaulInfoFetched = createAction<PartnerVaulInfo[]>(
  'vaults/multiplePartnerVaulInfoFetched',
);
