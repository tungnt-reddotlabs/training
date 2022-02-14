import { BigNumberish } from '@ethersproject/bignumber';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { mapValues, omit } from 'lodash';
import { AppState } from '..';
import { StablePool } from '../../models/StablePool';
import { toBigNumber } from '../../utils/numbers';
import { initialLoad, updatePoolConfig, updatePoolInfo } from './actions';

type StablePoolState = {
  id: string;
  // loaded immediately from config
  address: string;
  name: string;
  assets: Array<string>;
  basePool?: string;
  basePoolIndex?: number;
  lpToken: string;
  isPartner?: boolean;

  // initial load
  fee?: BigNumberish;
  adminFee?: BigNumberish;
  withdrawFee?: BigNumberish;
  a?: BigNumberish;

  // periodical load
  virtualPrice?: BigNumberish;
  totalSupply?: BigNumberish;
  balances?: Record<string, BigNumberish>;
};

const poolAdapter = createEntityAdapter<StablePoolState>();

export const initialState = poolAdapter.getInitialState();

const poolList = createSlice({
  name: 'pools',
  initialState: poolAdapter.getInitialState(),
  reducers: {},

  // builder pattern is cleaner
  extraReducers: (builder) => {
    builder.addCase(initialLoad, poolAdapter.setAll),
      builder.addCase(updatePoolConfig, (state, { payload }) => {
        poolAdapter.updateOne(state, {
          id: payload.id,
          changes: omit(payload, 'id'),
        });
      });

    builder.addCase(updatePoolInfo, (state, { payload }) => {
      poolAdapter.updateOne(state, {
        id: payload.id,
        changes: omit(payload, 'id'),
      });
    });
  },
});

export default poolList.reducer;

export const selectors = poolAdapter.getSelectors((s: AppState) => s.stablepool.pools);

export const deserializePool = (p: StablePoolState): StablePool => {
  if (!p) {
    return null;
  }
  return {
    ...p,
    fee: toBigNumber(p.fee),
    adminFee: toBigNumber(p.adminFee),
    withdrawFee: toBigNumber(p.withdrawFee),
    a: toBigNumber(p.a),
    // periodical load
    virtualPrice: toBigNumber(p.virtualPrice),
    totalSupply: toBigNumber(p.totalSupply),
    balances: mapValues(p.balances, toBigNumber),
  };
};
