import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import React, { useCallback, useMemo, useState } from 'react';
import { useContract } from '../../../hooks/useContract';
import { abi as VaultAbi } from '../../../abis/Vault.json';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { formatBigNumber } from '../../../utils/numbers';
import { useWeb3React } from '@web3-react/core';
import { useToken } from '../../../hooks/useToken';
import { Button } from '../../../components/Buttons';
import { screenUp } from '../../../utils/styles';
import styled from 'styled-components';
import { VaultingPoolInfo } from '../../../models/Vault';

interface VaulWithdrawProps {
  poolConfig: VaultingPoolInfo;
  amount: BigNumber;
  onWithdraw?: () => void;
}

const VaulButtonWithdraw: React.FC<VaulWithdrawProps> = ({
  poolConfig,
  amount,
  onWithdraw,
}) => {
  const { account } = useWeb3React();
  const wantToken = useToken(poolConfig?.poolConfig?.wantSymbol);
  const rewardToken = useToken(poolConfig?.poolConfig?.rewardToken);
  const masterChef = useContract(VaultAbi, poolConfig?.poolConfig?.address);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);

  const balance = useMemo(() => {
    return poolConfig?.userInfo?.amount;
  }, [poolConfig?.userInfo?.amount]);

  const hasInputError = useMemo(() => {
    if (!amount || !balance) {
      return false;
    }
    if (amount.lt(BigNumber.from(0)) || amount.gt(balance)) {
      return true;
    }
    return false;
  }, [amount, balance]);

  const isExceededBalance = useMemo(() => {
    if (amount && balance) {
      return amount?.gt(balance);
    }
    return false;
  }, [amount, balance]);

  const buttonText = useMemo(() => {
    if (isExceededBalance) {
      return `Withdraw`;
    } else {
      return `Withdraw`;
    }
  }, [isExceededBalance]);

  const disabled = useMemo(() => {
    return (
      !account ||
      !amount ||
      amount.eq(BigNumber.from(0)) ||
      hasInputError ||
      loading ||
      isExceededBalance
    );
  }, [account, amount, hasInputError, loading, isExceededBalance]);

  const error = useMemo(() => {
    return hasInputError || isExceededBalance;
  }, [hasInputError, isExceededBalance]);

  const createWithdrawTrx = useCallback(async () => {
    return (await masterChef?.safeCall.withdraw(amount)) as TransactionResponse;
  }, [account, amount, masterChef, poolConfig]);

  const withdraw = useCallback(async () => {
    if (!masterChef) return;
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Withdraw ${formatBigNumber(amount, rewardToken?.decimals, {
          fractionDigits: 4,
          significantDigits: 2,
        })} ${wantToken?.name}`,
        createWithdrawTrx,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
        onWithdraw && onWithdraw();
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    masterChef,
    handleTransactionReceipt,
    amount,
    rewardToken?.decimals,
    wantToken?.name,
    createWithdrawTrx,
    onWithdraw,
  ]);

  return (
    <StyledButton
      className={loading ? 'btn-loading' : ''}
      size="sm"
      disabled={disabled}
      onClick={withdraw}
      error={error}
    >
      {buttonText}
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  font-size: 12px;
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

export default VaulButtonWithdraw;
