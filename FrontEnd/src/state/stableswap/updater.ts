import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '..';
import { getDefaultSwapTokenSymbol } from '../../config';
import { useTokenPool } from '../stablepool/hooks';
import { selectFromToken, selectToToken, setSwapConfig } from './actions';
import { SwapConfig } from './reducer';

const Updater = () => {
  const tokenPoolMap = useTokenPool();
  const { chainId } = useWeb3React();
  const fromTokenSymbol = useSelector((t: AppState) => t.stableswap.fromTokenSymbol);
  const toTokenSymbol = useSelector((t: AppState) => t.stableswap.toTokenSymbol);
  const defaultSwapToken = getDefaultSwapTokenSymbol(chainId);
  const dispatch = useDispatch();

  const swapConfig = useMemo((): SwapConfig => {
    const from = tokenPoolMap[fromTokenSymbol];
    const to = tokenPoolMap[toTokenSymbol];

    if (!from || !to) {
      return;
    }

    if (from.pool == to.pool) {
      return {
        pool: from.poolAddress,
        fromIndex: from.index,
        toIndex: to.index,
        direction: 'samepool',
      };
    } else if (from.pool === to.basePool && !!to.basePool) {
      return {
        pool: to.poolAddress,
        basePool: from.poolAddress,
        fromIndex: from.index,
        toIndex: to.index,
        direction: 'swapFromBase',
      };
    } else if (to.pool === from.basePool && !!from.basePool) {
      return {
        pool: from.poolAddress,
        basePool: to.poolAddress,
        fromIndex: from.index,
        toIndex: to.index,
        direction: 'swapToBase',
      };
    } else {
      return null;
    }
  }, [fromTokenSymbol, toTokenSymbol, tokenPoolMap]);

  useEffect(() => {
    dispatch(setSwapConfig(swapConfig));
  }, [dispatch, swapConfig]);

  useEffect(() => {
    if (!dispatch || !defaultSwapToken?.fromTokenSymbol || !defaultSwapToken?.toTokenSymbol) {
      return
    }
    dispatch(selectFromToken(defaultSwapToken?.fromTokenSymbol))
    dispatch(selectToToken(defaultSwapToken?.toTokenSymbol))
  }, [defaultSwapToken, dispatch])

  return null;
};

export default Updater;
