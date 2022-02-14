import { createReducer } from '@reduxjs/toolkit';
import {
  selectFromToken,
  selectToToken,
  invertDirection,
  toggleAutoRefresh,
  setSwapConfig,
} from './actions';

export type SwapConfig =
  | {
      pool: string;
      fromIndex: number;
      toIndex: number;
      direction: 'samepool';
    }
  | {
      direction: 'swapFromBase';
      pool: string;
      basePool: string;
      fromIndex: number;
      toIndex: number;
    }
  | {
      direction: 'swapToBase';
      pool: string;
      basePool: string;
      fromIndex: number;
      toIndex: number;
    };

type State = {
  lastFromTokenSymbol?: string;
  fromTokenSymbol: string;
  toTokenSymbol: string;
  autoRefresh: boolean;
  swapConfig?: SwapConfig;
};

const initialState = {
  fromTokenSymbol: 'USDC',
  toTokenSymbol: 'USDT',
  autoRefresh: true,
} as State;

export default createReducer(initialState, (builder) => {
  builder.addCase(selectFromToken, (state, { payload }) => {
    if (payload === state?.toTokenSymbol) {
      const currentFromTokenSymbol = state.fromTokenSymbol;
      state.lastFromTokenSymbol = currentFromTokenSymbol;
      state.fromTokenSymbol = state.toTokenSymbol;
      state.toTokenSymbol = currentFromTokenSymbol;
      return;
    }
    state.lastFromTokenSymbol = state.fromTokenSymbol;
    state.fromTokenSymbol = payload;
  });

  builder.addCase(selectToToken, (state, { payload }) => {
    if (payload === state?.fromTokenSymbol) {
      const currentFromTokenSymbol = state.fromTokenSymbol;
      state.lastFromTokenSymbol = currentFromTokenSymbol;
      state.fromTokenSymbol = state.toTokenSymbol;
      state.toTokenSymbol = currentFromTokenSymbol;
      return;
    }
    state.toTokenSymbol = payload;
  });

  builder.addCase(invertDirection, (state) => {
    return {
      ...state,
      lastFromTokenSymbol: state.fromTokenSymbol,
      fromTokenSymbol: state.toTokenSymbol,
      toTokenSymbol: state.fromTokenSymbol,
    };
  });

  builder.addCase(toggleAutoRefresh, (state) => {
    state.autoRefresh = !state.autoRefresh;
  });

  builder.addCase(setSwapConfig, (state, { payload }) => {
    state.swapConfig = payload;
  });
});
