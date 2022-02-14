import { createAction } from '@reduxjs/toolkit';
import { SwapConfig } from './reducer';

export const selectFromToken = createAction<string>('stableswap/selectFromToken');

export const selectToToken = createAction<string>('stableswap/selectToToken');

export const invertDirection = createAction('stableswap/invertDirection');

export const toggleAutoRefresh = createAction('stableswap/toggleAutoRefresh');

export const setSwapConfig = createAction<SwapConfig>('stableswap/setSwapConfig');
