import { BigNumber } from '@ethersproject/bignumber';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTokenBalance } from '../../../state/user/hooks';
import { useToken } from '../../../hooks/useToken';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { useCallback } from 'react';
import { TokenInputWithMaxButton } from '../../../components/TokenInput/TokenInputWithMaxButton';
import { Zero } from '@ethersproject/constants';
import { useStakingVault } from '../../../state/staking/hooks';
import { Button } from '../../../components/Buttons';
import { useApprove } from '../../../hooks/useApprove';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useWeb3React } from '@web3-react/core';
import { abi as StakingAbi } from '../../../abis/Staking.json';
import { useContract } from '../../../hooks/useContract';
import { TransactionResponse } from '@ethersproject/providers';
import { formatBigNumber } from '../../../utils/numbers';
import imgVaultLock from '../../../assets/images/img-staking-lock.png';
import imgVaultFinished from '../../../assets/images/img-staking-finished.png';
import { screenUp } from '../../../utils/styles';
import { VaultStatus } from '../../../models/StakingVault';
import { useStakingVaultStatus } from '../hooks/useStakingVaultStatus';

interface StakingItemDepositProps {
  vaultAddress: string;
}

enum ButtonStatus {
  notConnect,
  vaultStarted,
  vaultFinished,
  notApprove,
  inApprove,
  notInput,
  insufficientBalance,
  notValidMaxCap,
  ready,
  inSubmit,
}

const StakingItemDeposit: React.FC<StakingItemDepositProps> = ({ vaultAddress }) => {
  const { account } = useWeb3React();
  const vault = useStakingVault(vaultAddress);
  const vaultConfig = vault?.vaultConfig;
  const vaultInfo = vault?.vaultInfo;
  const stakingContract = useContract(StakingAbi, vaultAddress);
  const wantToken = useToken(vaultConfig?.wantSymbol);
  const wantTokenBalance = useTokenBalance(wantToken?.symbol);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [loading, setLoading] = useState(false);
  const vaultStatus = useStakingVaultStatus(vaultAddress);
  const [status, setStatus] = useState(ButtonStatus.notInput);
  const [inputAmount, setInputAmount] = useState<BigNumber | undefined>(undefined);

  const { isApproved, approve, loadingSubmit } = useApprove(
    vaultConfig?.wantSymbol,
    vaultAddress,
  );

  const vaultLoading = useMemo(() => {
    return vaultStatus === undefined;
  }, [vaultStatus]);

  const notValidMaxCap = useMemo(() => {
    if (!inputAmount || vaultInfo?.maxCap) {
      return false;
    }
    return inputAmount.add(vaultInfo?.totalStaked).gt(vaultInfo?.maxCap);
  }, [inputAmount, vaultInfo?.maxCap, vaultInfo?.totalStaked]);

  useEffect(() => {
    if (!account) {
      setStatus(ButtonStatus.notConnect);
      return;
    }
    if (vaultStatus === VaultStatus.locked) {
      setStatus(ButtonStatus.vaultStarted);
      return;
    }
    if (vaultStatus === VaultStatus.finished) {
      setStatus(ButtonStatus.vaultFinished);
      return;
    }
    if (notValidMaxCap) {
      setStatus(ButtonStatus.notValidMaxCap);
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
    if (!inputAmount || inputAmount?.eq(Zero)) {
      setStatus(ButtonStatus.notInput);
      return;
    }
    if (inputAmount?.gt(wantTokenBalance)) {
      setStatus(ButtonStatus.insufficientBalance);
      return;
    }
    setStatus(ButtonStatus.ready);
  }, [
    account,
    inputAmount,
    wantTokenBalance,
    isApproved,
    loading,
    loadingSubmit,
    notValidMaxCap,
    vaultStatus,
  ]);

  const buttonText = useMemo(() => {
    switch (status) {
      case ButtonStatus.vaultStarted:
        return `Vault has already started`;
      case ButtonStatus.vaultFinished:
        return `Vault finished`;
      case ButtonStatus.notApprove:
        return `Approve`;
      case ButtonStatus.inApprove:
        return `Approve`;
      case ButtonStatus.insufficientBalance:
        return `Insufficient balance`;
      case ButtonStatus.notValidMaxCap:
        return `Exceeded max cap`;
      case ButtonStatus.inSubmit:
        return `Deposit`;
      default:
        return 'Deposit';
    }
  }, [status]);

  const disabled = useMemo(() => {
    switch (status) {
      case ButtonStatus.notConnect:
      case ButtonStatus.vaultStarted:
      case ButtonStatus.vaultFinished:
      case ButtonStatus.notInput:
      case ButtonStatus.inApprove:
      case ButtonStatus.inSubmit:
      case ButtonStatus.insufficientBalance:
      case ButtonStatus.notValidMaxCap:
        return true;
      case ButtonStatus.notApprove:
      case ButtonStatus.ready:
        return false;
      default:
        return false;
    }
  }, [status]);

  const resetFrom = useCallback(() => {
    setInputAmount(undefined);
  }, []);

  const createStakeTrx = useCallback(async () => {
    return (await stakingContract?.safeCall.deposit(inputAmount)) as TransactionResponse;
  }, [inputAmount, stakingContract?.safeCall]);

  const stake = useCallback(async () => {
    if (!stakingContract) return;
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Deposit ${formatBigNumber(inputAmount, wantToken.decimals, {
          fractionDigits: 6,
          significantDigits: 3,
          compact: false,
        })} ${wantToken?.name}`,
        createStakeTrx,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
        resetFrom();
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    stakingContract,
    handleTransactionReceipt,
    inputAmount,
    wantToken.decimals,
    wantToken?.name,
    createStakeTrx,
    resetFrom,
  ]);

  const onButtonClick = useCallback(() => {
    switch (status) {
      case ButtonStatus.notApprove: {
        return approve();
      }
      default:
        return stake();
    }
  }, [approve, stake, status]);

  const onClickBalance = useCallback(() => {
    setInputAmount(wantTokenBalance);
  }, [wantTokenBalance]);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>Deposit</StyledTitle>
        {vaultStatus === VaultStatus.notStated && (
          <StyledBalance>
            Balance:&nbsp;
            <button
              onClick={onClickBalance}
              disabled={!wantTokenBalance || wantTokenBalance?.eq(Zero)}
            >
              <BigNumberValue
                value={wantTokenBalance}
                decimals={wantToken?.decimals}
                fractionDigits={4}
                keepCommas
              />
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
            {vaultStatus === VaultStatus.notStated && (
              <TokenInputWithMaxButton
                decimals={wantToken?.decimals}
                symbol={wantToken?.symbol}
                value={inputAmount}
                maxValue={wantTokenBalance}
                onChange={setInputAmount}
                background="#fff"
              />
            )}
            {vaultStatus === VaultStatus.notStated && (
              <StyledActions>
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
              </StyledActions>
            )}
            {vaultStatus === VaultStatus.finished || vaultStatus === VaultStatus.locked ? (
              <StyledVaultStated>
                <img
                  src={vaultStatus === VaultStatus.finished ? imgVaultFinished : imgVaultLock}
                  style={{ width: vaultStatus === VaultStatus.finished ? '63px' : '44px' }}
                />
                <div>Locked for deposit</div>
              </StyledVaultStated>
            ) : null}
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

const StyledVaultStated = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #74757c;
  img {
    margin-bottom: 10px;
  }
`;

const StyledActions = styled.div`
  margin-top: 26px;
  text-align: center;
`;

export default StakingItemDeposit;
