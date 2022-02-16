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
import { screenUp } from '../../../utils/styles';
import { VaultingPoolInfo } from '../../../models/Vault';

interface VaulButtonWithdrawAllProps {
  poolConfig: VaultingPoolInfo;
}

const VaulButtonWithdrawAll: React.FC<VaulButtonWithdrawAllProps> = ({ poolConfig }) => {
  const { account } = useWeb3React();
  const masterChef = useContract(VaultAbi, poolConfig?.poolConfig?.address);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);

  const balance = useMemo(() => {
    return poolConfig?.userInfo?.amount;
  }, [poolConfig?.userInfo?.amount]);

  const disabled = useMemo(() => {
    return loading || !account || !balance || balance?.eq(Zero);
  }, [account, balance, loading]);

  const createWithdrawAllTrx = useCallback(async () => {
    return (await masterChef?.safeCall.withdrawAll()) as TransactionResponse;
  }, [account, masterChef, poolConfig, balance]);

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
