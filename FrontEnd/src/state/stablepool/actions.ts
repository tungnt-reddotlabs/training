import { BigNumber } from '@ethersproject/bignumber';
import { createAction } from '@reduxjs/toolkit';

export const enterPool = createAction<string>('stablepool/enterPool');

export const leavePool = createAction<string>('stablepool/leavePool');

export const initialLoad = createAction<
  Array<{
    id: string;
    name: string;
    address: string;
    assets: string[];
    basePool?: string;
    lpToken: string;
  }>
>('stablepool/initialLoad');

export const initialLoadSuccess = createAction<{
  poolAddress: string;
  assets: Array<string>;
  lpToken: string;
  lpDecimals: number;
  basePool?: {
    address: string;
    assets: string[];
    lpToken: string;
    balances: Record<string, BigNumber>;
  };
}>('stablepool/initialLoad/success');

export const initialLoadError = createAction<{ poolId: string; error: string }>(
  'stablepool/initialLoad/error',
);

export const updatePoolInfo = createAction<{
  id: string;
  adminBalances: string[];
  virtualPrice: string;
  balances: Record<string, string>;
  totalSupply: string;
}>('stablepool/updatePoolInfo');

export const updatePoolConfig = createAction<{
  id: string;
  fee: string;
  adminFee: string;
  withdrawFee: string;
  a: string;
}>('stablepool/updateConfig');

export const watchPools = createAction<string[]>('stablepool/watchPools');
