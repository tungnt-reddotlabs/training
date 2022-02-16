import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { getAllPartnerVaultsConfig } from '../../../config';

export const usePartnerVaultConfig = () => {
  const { chainId } = useWeb3React();

  return useMemo(() => {
    return getAllPartnerVaultsConfig(chainId) || [];
  }, [chainId]);
};
