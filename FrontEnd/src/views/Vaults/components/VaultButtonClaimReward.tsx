import React, { useMemo, useState } from 'react';
import { useCallback } from 'react';
import { abi as VaultAbi } from '../../../abis/Vault.json';
import { useContract } from '../../../hooks/useContract';
import { TransactionResponse } from '@ethersproject/providers';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useWeb3React } from '@web3-react/core';
import { useToken } from '../../../hooks/useToken';
import { ButtonOutline } from '../../../components/Buttons';
import styled from 'styled-components';
import { VaulPoolConfig } from '../../../models/Vault';

export type VaultButtonClaimRewardProps = {
  pool: VaulPoolConfig;
};

const VaultButtonClaimReward: React.FC<VaultButtonClaimRewardProps> = ({ pool }) => {
  const { account } = useWeb3React();
  const rewardToken = useToken(pool?.rewardToken);
  const masterChef = useContract(VaultAbi, pool?.address);
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
      !account
    );
  }, [loading, pool, account]);

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
