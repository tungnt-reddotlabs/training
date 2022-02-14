import { createSlice } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { enterPool, leavePool, watchPools } from './actions';
import poolList, { initialState as pools } from './poolList';

const currentPoolSlice = createSlice({
  name: 'currentPool',
  initialState: null as string,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(enterPool, (_, { payload }) => {
      return payload;
    });

    builder.addCase(leavePool, () => null);
  },
});

const watchedPoolSlice = createSlice({
  name: 'watchedPool',
  initialState: [] as string[],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(watchPools, (_, { payload }) => {
      return payload;
    });

    builder.addCase(leavePool, () => []);
  },
});

const reducers = combineReducers({
  pools: poolList,
  currentPool: currentPoolSlice.reducer,
  watchedPools: watchedPoolSlice.reducer,
});

export const initialState = {
  pools,
  watchedPool: [],
};

export default reducers;
