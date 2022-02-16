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
import { VaulPoolConfig } from '../../../models/Vault';

export type VaultButtonCompoundProps = {
  pool: VaulPoolConfig;
};

const VaultButtonCompound: React.FC<VaultButtonCompoundProps> = ({ pool }) => {
  const { account } = useWeb3React();
  const masterChef = useContract(VaultAbi, pool?.address);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);

  const compound = useCallback(async () => {
    return (await masterChef?.safeCall.compound()) as TransactionResponse;
  }, [account, masterChef, pool]);

  const onCompound = useCallback(async () => {
    if (!masterChef) return;
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Compounded`,
        compound,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [masterChef, handleTransactionReceipt, compound]);

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
      onClick={onCompound}
    >
      Compound
    </StyledButton>
  );
};

const StyledButton = styled(ButtonOutline)`
  height: 30px;
  padding: 0px 6px;
  font-size: 12px;
`;

export default VaultButtonCompound;
