import { difference, union } from 'lodash';
import { useMemo } from 'react';
import { useAllPoolConfig } from '../../../state/stablepool/hooks';

export const useTokenList = () => {
  const pools = useAllPoolConfig();

  return useMemo(() => {
    const lps = pools.map((t) => t.lpToken);
    return difference(union(...pools.map((t) => t.assets)), lps);
  }, [pools]);
};
