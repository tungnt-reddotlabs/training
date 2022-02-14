import { BigNumber } from '@ethersproject/bignumber';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useToken } from '../../../hooks/useToken';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { useCallback } from 'react';
import { useStakingVault } from '../../../state/staking/hooks';
import { Button } from '../../../components/Buttons';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useWeb3React } from '@web3-react/core';
import { abi as StakingAbi } from '../../../abis/Staking.json';
import { useContract } from '../../../hooks/useContract';
import { TransactionResponse } from '@ethersproject/providers';
import { formatBigNumber } from '../../../utils/numbers';
import { Zero } from '@ethersproject/constants';
import { TokenInputWithMaxButton } from '../../../components/TokenInput';
import { screenUp } from '../../../utils/styles';
import { VaultStatus } from '../../../models/StakingVault';
import { useStakingVaultStatus } from '../hooks/useStakingVaultStatus';

interface StakingItemWithdrawProps {
  vaultAddress: string;
}

const StakingItemWithdraw: React.FC<StakingItemWithdrawProps> = ({ vaultAddress }) => {
  const { account } = useWeb3React();
  const vault = useStakingVault(vaultAddress);
  const vaultConfig = vault?.vaultConfig;
  const userInfo = vault?.userInfo;
  const stakingContract = useContract(StakingAbi, vaultAddress);
  const wantToken = useToken(vaultConfig?.wantSymbol);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [loadingEarlyWithdraw, setLoadingEarlyWithdraw] = useState(false);
  const vaultStatus = useStakingVaultStatus(vaultAddress);

  const vaultLoading = useMemo(() => {
    return vaultStatus === undefined;
  }, [vaultStatus]);

  const createWithdrawTrx = useCallback(async () => {
    return (await stakingContract?.safeCall.withdraw()) as TransactionResponse;
  }, [stakingContract?.safeCall]);

  const withdraw = useCallback(async () => {
    if (!stakingContract) return;
    setLoadingWithdraw(true);
    try {
      const tx = await handleTransactionReceipt(`Withdraw`, createWithdrawTrx);
      if (tx) {
        await tx.wait();
        setLoadingWithdraw(false);
      }
    } catch (error) {
      setLoadingWithdraw(false);
    }
  }, [stakingContract, handleTransactionReceipt, createWithdrawTrx]);

  const balance = useMemo(() => {
    return userInfo?.amount;
  }, [userInfo?.amount]);

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

  const buttonEarlyWithdrawText = useMemo(() => {
    if (isExceededBalance) {
      return `Insufficient balance`;
    } else {
      return `Withdraw Early`;
    }
  }, [isExceededBalance]);

  const earlyWithdrawDisabled = useMemo(() => {
    return (
      !account ||
      !amount ||
      amount.eq(BigNumber.from(0)) ||
      hasInputError ||
      loadingEarlyWithdraw ||
      isExceededBalance
    );
  }, [account, amount, hasInputError, loadingEarlyWithdraw, isExceededBalance]);

  const createEarlyWithdrawTrx = useCallback(async () => {
    return (await stakingContract?.safeCall.earlyWithdraw(amount)) as TransactionResponse;
  }, [amount, stakingContract?.safeCall]);

  const earlyWithdraw = useCallback(async () => {
    if (!stakingContract) return;
    setLoadingEarlyWithdraw(true);
    try {
      const tx = await handleTransactionReceipt(
        `Early withdraw ${formatBigNumber(amount, wantToken?.decimals, {
          fractionDigits: 4,
          significantDigits: 2,
        })} ${wantToken?.name}`,
        createEarlyWithdrawTrx,
      );
      if (tx) {
        await tx.wait();
        setLoadingEarlyWithdraw(false);
        setAmount(undefined);
      }
    } catch (error) {
      setLoadingEarlyWithdraw(false);
    }
  }, [
    stakingContract,
    handleTransactionReceipt,
    amount,
    wantToken?.decimals,
    wantToken?.name,
    createEarlyWithdrawTrx,
  ]);

  const onClickBalance = useCallback(() => {
    setAmount(userInfo?.amount);
  }, [userInfo?.amount]);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>Withdraw</StyledTitle>
        {vaultStatus === VaultStatus.notStated && (
          <StyledBalance>
            Deposited:&nbsp;
            <button
              onClick={onClickBalance}
              disabled={!userInfo?.amount || userInfo?.amount?.eq(Zero)}
            >
              <BigNumberValue value={userInfo?.amount} decimals={18} />
            </button>
            &nbsp;{wantToken?.symbol}
          </StyledBalance>
        )}
      </StyledHeader>
      <StyledControl>
        {vaultLoading ? (
          <StyledLoadingContainer>
            <i className="fal fa-spinner-third fa-spin fa-2x text-muted"></i>
          </StyledLoadingContainer>
        ) : (
          <>
            <StyledInfo>
              {vaultStatus !== VaultStatus.notStated && (
                <StyledRow>
                  Deposited:
                  <span>
                    <BigNumberValue value={userInfo?.amount} decimals={18} />
                  </span>
                </StyledRow>
              )}
              {vaultStatus !== VaultStatus.notStated && (
                <StyledRow>
                  Total reward:
                  <span>
                    <BigNumberValue value={userInfo?.pendingReward} decimals={18} />
                  </span>
                </StyledRow>
              )}
            </StyledInfo>
            {vaultStatus !== VaultStatus.notStated && (
              <StyledActions>
                <Button
                  className={loadingWithdraw ? 'btn-loading' : ''}
                  size="sm"
                  disabled={
                    vaultStatus !== VaultStatus.finished ||
                    !userInfo?.amount ||
                    userInfo?.amount?.eq(Zero)
                  }
                  onClick={withdraw}
                >
                  Withdraw &amp; Claim Rewards
                </Button>
              </StyledActions>
            )}
            {vaultStatus === VaultStatus.notStated && (
              <>
                <TokenInputWithMaxButton
                  decimals={wantToken?.decimals}
                  symbol={wantToken?.symbol}
                  value={amount}
                  maxValue={balance}
                  onChange={setAmount}
                  background="#fff"
                />
                <StyledActions>
                  <Button
                    className={loadingEarlyWithdraw ? 'btn-loading' : ''}
                    size="sm"
                    disabled={earlyWithdrawDisabled}
                    onClick={earlyWithdraw}
                  >
                    {buttonEarlyWithdrawText}
                  </Button>
                </StyledActions>
              </>
            )}
          </>
        )}
      </StyledControl>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLoadingContainer = styled.div`
  height: 100%;
  padding: 22px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #abaebd;
`;

const StyledHeader = styled.div`
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledTitle = styled.div`
  width: 100px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #070a10;
  background-color: #e5e7ef;
`;

const StyledBalance = styled.div`
  font-size: 12px;
  color: #555a71;
  font-weight: normal;
  button {
    color: #3085b1;
    padding: 0;
    :hover {
      color: #070a10;
    }
  }
`;

const StyledControl = styled.div`
  flex: 1;
  background-color: #e5e7ef;
  padding: 20px 12px;
  ${screenUp('lg')`
     padding: 20px 17px;
  `}
`;

const StyledInfo = styled.div``;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: normal;
  color: #555a71;
  span {
    color: #070a10;
  }
  :not(:last-child) {
    padding-bottom: 10px;
  }
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

const StyledActions = styled.div`
  margin-top: 26px;
  text-align: center;
`;

export default StakingItemWithdraw;
