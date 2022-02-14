import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '..';
import {
  getChainStableCoinSymbols,
  getPartnerStableCoinSymbols,
  getTokenConfig,
} from '../../config';
import useQuery from '../../hooks/useQuery';
import { useTokenList } from '../../views/Swap/hooks/useTokenList';
import { invertDirection, selectToToken, selectFromToken, toggleAutoRefresh } from './actions';

export function useInvertDirection(): () => void {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(invertDirection());
  }, [dispatch]);
}

export const useSelectFromToken = () => {
  const dispatch = useDispatch();

  return useCallback(
    (token: string) => {
      dispatch(selectFromToken(token));
    },
    [dispatch],
  );
};

export const useSelectToToken = () => {
  const dispatch = useDispatch();

  return useCallback(
    (token: string) => {
      dispatch(selectToToken(token));
    },
    [dispatch],
  );
};

export const useToggleAutoRefresh = () => {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(toggleAutoRefresh());
  }, [dispatch]);
};

export const useStableswap = () => {
  return useSelector((s: AppState) => s.stableswap);
};

export const useIsAutoRefresh = () => {
  return useSelector((s: AppState) => s.stableswap.autoRefresh);
};

export const useFromToken = () => {
  const { chainId } = useWeb3React();
  const token = useSelector((s: AppState) => s.stableswap.fromTokenSymbol);

  return useMemo(() => {
    return getTokenConfig(chainId, token);
  }, [chainId, token]);
};

export const useToToken = () => {
  const { chainId } = useWeb3React();
  const token = useSelector((s: AppState) => s.stableswap.toTokenSymbol);

  return useMemo(() => {
    return getTokenConfig(chainId, token);
  }, [chainId, token]);
};

export const useLastFromToken = () => {
  const { chainId } = useWeb3React();
  const token = useSelector((s: AppState) => s.stableswap.lastFromTokenSymbol);

  return useMemo(() => {
    return getTokenConfig(chainId, token);
  }, [chainId, token]);
};

export const useIgnoreSelectTokens = () => {
  const { chainId } = useWeb3React();
  const fromTokenSymbol = useSelector((s: AppState) => s.stableswap.fromTokenSymbol);
  const toTokenSymbol = useSelector((s: AppState) => s.stableswap.toTokenSymbol);
  const partnerStableCoinSymbols = getPartnerStableCoinSymbols(chainId);
  const chainStableCoinSymbols = getChainStableCoinSymbols(chainId);

  return useMemo(() => {
    let ignoreFromTokens = [];
    let ignoreToTokens = [];
    partnerStableCoinSymbols.forEach((token) => {
      if (fromTokenSymbol === token) {
        ignoreToTokens = partnerStableCoinSymbols.filter((t) => t !== token);
        chainStableCoinSymbols.forEach((chainTokens) => {
          if (chainTokens.includes(token)) {
            ignoreToTokens = ignoreToTokens.filter(
              (ignoreToken) => !chainTokens.includes(ignoreToken),
            );
          }
        });
        return;
      }
      if (toTokenSymbol === token) {
        ignoreFromTokens = partnerStableCoinSymbols.filter((t) => t !== token);
        chainStableCoinSymbols.forEach((chainTokens) => {
          if (chainTokens.includes(token)) {
            ignoreFromTokens = ignoreFromTokens.filter(
              (ignoreToken) => !chainTokens.includes(ignoreToken),
            );
          }
        });
        return;
      }
    });
    return {
      from: ignoreFromTokens,
      to: ignoreToTokens,
    };
  }, [chainStableCoinSymbols, fromTokenSymbol, partnerStableCoinSymbols, toTokenSymbol]);
};

export const useSwapConfig = () => {
  return useSelector((s: AppState) => s.stableswap.swapConfig);
};

export const useSetSwapPair = () => {
  const query = useQuery();
  const tokens = useTokenList();
  const dispatch = useDispatch();

  useEffect(() => {
    const input = query.get('input')?.toUpperCase() as string;
    const output = query.get('output')?.toUpperCase() as string;

    if (tokens.includes(input)) {
      dispatch(selectFromToken(input));
    }

    if (output !== input && tokens.includes(output)) {
      dispatch(selectToToken(output));
    }
  }, [dispatch, query, tokens]);
};
