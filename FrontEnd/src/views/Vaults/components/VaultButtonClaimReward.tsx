import React, { useMemo, useState } from 'react';
import { useCallback } from 'react';
import { Zero } from '@ethersproject/constants';
import { abi as VaultAbi } from '../../../abis/Vault.json';
import { useContract } from '../../../hooks/useContract';
import { TransactionResponse } from '@ethersproject/providers';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useWeb3React } from '@web3-react/core';
import { useToken } from '../../../hooks/useToken';
import { ButtonOutline } from '../../../components/Buttons';
import styled from 'styled-components';
import { useVaultingPool } from '../../../state/vaults/hooks';

export type VaultButtonClaimRewardProps = {
  minichef: string;
  poolId: number;
};

const VaultButtonClaimReward: React.FC<VaultButtonClaimRewardProps> = ({ poolId, minichef }) => {
  const { account } = useWeb3React();
  const pool = useVaultingPool(minichef, poolId);
  const rewardToken = useToken(pool?.poolConfig?.rewardToken);
  const masterChef = useContract(VaultAbi, pool?.poolConfig?.address);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);

  const harvest = useCallback(async () => {
    return (await masterChef?.safeCall.claimRewards()) as TransactionResponse;
  }, [account, masterChef, pool]);

  const onHarvest = useCallback(async () => {
    if (!masterChef) return;
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Claim ${rewardToken?.symbol} rewards`,
        harvest,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [masterChef, handleTransactionReceipt, rewardToken?.symbol, harvest]);

  const disabled = useMemo(() => {
    return (
      loading ||
      !pool?.userInfo?.pendingReward ||
      pool?.userInfo?.pendingReward?.eq(Zero) ||
      !account
    );
  }, [loading, pool?.userInfo?.pendingReward, account]);

  return (
    <StyledButton
      className={loading ? 'btn-loading' : ''}
      size="sm"
      disabled={disabled}
      onClick={onHarvest}
    >
      Claim
    </StyledButton>
  );
};

const StyledButton = styled(ButtonOutline)`
  height: 30px;
  padding: 0px 6px;
  font-size: 12px;
`;

export default VaultButtonClaimReward;
