import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getAllVaultsConfig } from '../../../config';

export const useVaultConfig = () => {
  const { chainId } = useWeb3React();

  return useMemo(() => {
    return getAllVaultsConfig(chainId) || [];
  }, [chainId]);
};
