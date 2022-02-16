import { TransactionResponse } from '@ethersproject/providers';
import React, { useCallback, useState } from 'react';
import { useContract } from '../../../hooks/useContract';
import { abi as VaultAbi } from '../../../abis/Vault.json';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useWeb3React } from '@web3-react/core';
import { ButtonOutline } from '../../../components/Buttons';
import { Zero } from '@ethersproject/constants';
import { useMemo } from 'react';
import styled from 'styled-components';
import { useVaultingPool } from '../../../state/vaults/hooks';
import { screenUp } from '../../../utils/styles';

interface VaulButtonWithdrawAllProps {
  poolId: number;
  minichef: string;
}

const VaulButtonWithdrawAll: React.FC<VaulButtonWithdrawAllProps> = ({ poolId, minichef }) => {
  const { account } = useWeb3React();
  const pool = useVaultingPool(minichef, poolId);
  const masterChef = useContract(VaultAbi, pool?.poolConfig?.address);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);

  const balance = useMemo(() => {
    return pool?.userInfo?.amount;
  }, [pool?.userInfo?.amount]);

  const disabled = useMemo(() => {
    return loading || !account || !balance || balance?.eq(Zero);
  }, [account, balance, loading]);

  const createWithdrawAllTrx = useCallback(async () => {
    return (await masterChef?.safeCall.withdrawAll()) as TransactionResponse;
  }, [account, masterChef, pool, balance]);

  const withdrawAll = useCallback(async () => {
    if (!masterChef) return;
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(`Withdraw all`, createWithdrawAllTrx);
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [createWithdrawAllTrx, handleTransactionReceipt, masterChef]);

  return (
    <StyledButton
      className={loading ? 'btn-loading' : ''}
      size="sm"
      disabled={disabled}
      onClick={withdrawAll}
    >
      Withdraw all
    </StyledButton>
  );
};

const StyledButton = styled(ButtonOutline)`
  font-size: 12px;
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

export default VaulButtonWithdrawAll;
