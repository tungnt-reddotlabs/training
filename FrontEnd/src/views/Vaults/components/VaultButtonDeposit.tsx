import { BigNumber } from '@ethersproject/bignumber';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useContract } from '../../../hooks/useContract';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useTokenBalance } from '../../../state/user/hooks';
import { abi as VaultAbi } from '../../../abis/Vault.json';
import { formatBigNumber } from '../../../utils/numbers';
import { TransactionResponse } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useToken } from '../../../hooks/useToken';
import { Button } from '../../../components/Buttons/Button';
import { useApprove } from '../../../hooks/useApprove';
import { useVaultingPool } from '../../../state/vaults/hooks';
import { Zero } from '@ethersproject/constants';
import { VaulPoolConfig } from '../../../models/Vault';

interface VaulButtonDepositProps {
  poolConfig: VaulPoolConfig;
  amount: BigNumber;
  onDeposited?: () => void;
}

enum ButtonStatus {
  notConnect = 0,
  notApprove = 1,
  inApprove = 2,
  notInput = 3,
  insufficientBalance = 4,
  ready = 5,
  inSubmit = 6,
}

const VaulButtonDeposit: React.FC<VaulButtonDepositProps> = ({
  poolConfig,
  amount,
  onDeposited,
}) => {
  const { account } = useWeb3React();
  const wantToken = useToken(poolConfig.wantSymbol);
  const masterChef = useContract(VaultAbi, poolConfig.address);
  const balance = useTokenBalance(wantToken?.symbol);
  const { isApproved, approve, loadingSubmit } = useApprove(
    wantToken?.symbol,
    poolConfig.address
  );
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(ButtonStatus.notInput);

  useEffect(() => {
    if (!account) {
      setStatus(ButtonStatus.notConnect);
      return;
    }
    if (!isApproved && loadingSubmit) {
      setStatus(ButtonStatus.inApprove);
      return;
    }
    if (!isApproved) {
      setStatus(ButtonStatus.notApprove);
      return;
    }
    if (loading) {
      setStatus(ButtonStatus.inSubmit);
      return;
    }
    if (!amount || amount?.eq(Zero)) {
      setStatus(ButtonStatus.notInput);
      return;
    }
    if (amount?.gt(balance)) {
      setStatus(ButtonStatus.insufficientBalance);
      return;
    }
    setStatus(ButtonStatus.ready);
  }, [account, amount, balance, isApproved, loading, loadingSubmit]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.notApprove:
        return `Approve`;
      case ButtonStatus.inApprove:
        return `Approve`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      case ButtonStatus.inSubmit:
        return `Deposit`;
      default:
        return 'Deposit';
    }
  }, [status]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
      case ButtonStatus.notInput:
      case ButtonStatus.inApprove:
      case ButtonStatus.inSubmit:
      case ButtonStatus.insufficientBalance:
        return true;
      case ButtonStatus.notApprove:
      case ButtonStatus.ready:
        return false;
      default:
        return false;
    }
  }, [status]);

  const createStakeTrx = useCallback(async () => {
    const result = await masterChef?.safeCall.deposit(amount);
    return result as TransactionResponse;
  }, [account, amount, masterChef, poolConfig]);

  const stake = useCallback(async () => {
    if (!masterChef) return;
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Deposit ${formatBigNumber(amount, wantToken.decimals, {
          fractionDigits: 6,
          significantDigits: 3,
          compact: false,
        })} ${wantToken?.name}`,
        createStakeTrx,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
        onDeposited && onDeposited();
      }
    } catch (error) {
      setLoading(false);
    }
  }, [masterChef, handleTransactionReceipt, amount, wantToken, createStakeTrx, onDeposited]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notApprove: {
        return approve();
      }
      default:
        return stake();
    }
  }, [approve, stake, status]);

  return (
    <Button
      className={
        status === ButtonStatus.inApprove || status === ButtonStatus.inSubmit
          ? 'btn-loading'
          : ''
      }
      size="sm"
      disabled={disabled}
      onClick={onButtonClick}
    >
      {buttonText}
    </Button>
  );
};

export default VaulButtonDeposit;
