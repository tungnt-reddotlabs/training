import { useCallback, useState } from 'react';
import useInterval from '../../../hooks/useInterval';
import { VaultStatus } from '../../../models/StakingVault';
import { useStakingVault } from '../../../state/staking/hooks';

export const useStakingVaultStatus = (address: string) => {
  const vault = useStakingVault(address);
  const vaultInfo = vault?.vaultInfo;
  const [status, setStatus] = useState(undefined);

  const checkVaultStatus = useCallback(() => {
    if (!vaultInfo?.startLockTime || !vaultInfo?.endLockTime) {
      return;
    }
    if (Date.now() < vaultInfo?.startLockTime * 1000) {
      setStatus(VaultStatus.notStated);
      return;
    }
    if (Date.now() >= vaultInfo?.endLockTime * 1000) {
      setStatus(VaultStatus.finished);
      return;
    }
    setStatus(VaultStatus.locked);
  }, [vaultInfo?.endLockTime, vaultInfo?.startLockTime]);

  useInterval(checkVaultStatus, 1000);

  return status;
};
