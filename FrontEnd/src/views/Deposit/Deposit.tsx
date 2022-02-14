import { BigNumber } from '@ethersproject/bignumber';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useGetSlippageTolerance } from '../../state/application/hooks';
import { useCurrentPool, useCurrentPoolAssets } from '../../state/stablepool/hooks';
import { TokenInput } from './components/TokenInput';
import { useEstimatedOutput } from './hooks/useEstimatedOutput';
import useModal from '../../hooks/useModal';
import { ModalConfirmDeposit } from './components/ModalConfirmDeposit';
import { Button } from '../../components/Buttons/Button';
import { BigNumberValue } from '../../components/BigNumberValue';
import { Label, Value, TwoColumnGrid } from '../PoolDetail/components/Share';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { parseUnits } from '@ethersproject/units';
import { useUserToken } from '../../state/user/hooks';
import { Zero } from '@ethersproject/constants';
import { screenUp } from '../../utils/styles';
import { BonusPrecision, ImpactPrecision } from '../../utils/constants';

const ImpactThreshold = parseUnits('2', 8);

export const Deposit: React.FC = () => {
  const { account } = useWeb3React();
  const slippage = useGetSlippageTolerance();
  const pool = useCurrentPool();
  const lpToken = useUserToken(pool?.lpToken);
  const [useBasePoolToken, setUseBasePoolToken] = useState(false);
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const [amounts, setAmounts] = useState<BigNumber[]>([]);

  const isInputDepositAmount = useMemo(() => {
    return amounts?.filter((i) => i?.gt(Zero)).length > 0;
  }, [amounts]);

  const onChange = useCallback((index: number, value: BigNumber) => {
    setAmounts((t) => {
      t[index] = value;
      return [...t];
    });
  }, []);

  const estimatedOutput = useEstimatedOutput(amounts, useBasePoolToken);

  const resetAmount = useCallback(() => {
    setAmounts([]);
  }, []);

  useEffect(() => {
    resetAmount();
  }, [account, resetAmount]);

  const [showConfirm] = useModal(
    <ModalConfirmDeposit
      estimation={estimatedOutput}
      input={amounts}
      onConfirm={resetAmount}
      useBasePoolToken={useBasePoolToken}
    />,
  );

  const insufficientBalance = useMemo(() => {
    return amounts.some((t, index) => assets[index].balance && t?.gt(assets[index].balance));
  }, [amounts, assets]);

  const disabled = useMemo(() => {
    if (!pool?.totalSupply || pool?.totalSupply.eq(0)) {
      return insufficientBalance;
    }

    return insufficientBalance || !estimatedOutput?.lpAmount || estimatedOutput?.lpAmount.eq(0);
  }, [estimatedOutput, insufficientBalance, pool]);

  const buttonText = useMemo(() => {
    if (insufficientBalance) return 'Insufficient balance';
    return 'Deposit';
  }, [insufficientBalance]);

  const minimumReceived = useMemo(() => {
    return estimatedOutput?.lpAmount
      ?.mul(BigNumber.from(1e6).sub(BigNumber.from((slippage * 10 ** 6).toFixed(0))))
      ?.div(1e6);
  }, [estimatedOutput?.lpAmount, slippage]);

  return (
    <StyledContainer>
      <div>
        {assets.map((t, index) => (
          <TokenInput
            key={t.symbol}
            index={index}
            value={amounts[index]}
            onChange={onChange}
            showLine={index < assets.length - 1}
            useBasePoolToken={useBasePoolToken}
            onToggle={
              pool?.basePool && index === pool.basePoolIndex - 1
                ? setUseBasePoolToken
                : undefined
            }
          />
        ))}
      </div>

      <InfoList>
        <Label>Share of pool</Label>
        <Value>
          {isInputDepositAmount && !estimatedOutput?.poolShare ? (
            <i className="far fa-circle-notch fa-spin" />
          ) : (
            <BigNumberValue
              percentage
              value={estimatedOutput?.poolShare}
              decimals={6}
              fractionDigits={2}
            />
          )}
        </Value>
        <>
          <Label>{estimatedOutput?.impact ? 'Price impact' : 'Bonus'}</Label>
          {estimatedOutput?.impact ? (
            <Value variant={estimatedOutput?.impact.gt(ImpactThreshold) ? 'danger' : 'normal'}>
              {estimatedOutput?.impact && estimatedOutput?.impact?.gte(ImpactPrecision)
                ? '-'
                : ''}
              {isInputDepositAmount && !estimatedOutput?.impact ? (
                <i className="far fa-circle-notch fa-spin" />
              ) : (
                <BigNumberValue
                  value={estimatedOutput?.impact}
                  decimals={10}
                  percentage
                  fractionDigits={4}
                />
              )}
            </Value>
          ) : (
            <Value variant={estimatedOutput?.bonus ? 'success' : 'normal'}>
              {estimatedOutput?.bonus && estimatedOutput?.bonus?.gte(BonusPrecision) ? '+' : ''}
              {isInputDepositAmount && !estimatedOutput?.bonus ? (
                <i className="far fa-circle-notch fa-spin" />
              ) : (
                <BigNumberValue
                  value={estimatedOutput?.bonus}
                  decimals={10}
                  percentage
                  fractionDigits={4}
                />
              )}
            </Value>
          )}
        </>
        <Label>Minimum received</Label>
        <Value>
          {isInputDepositAmount && !minimumReceived ? (
            <i className="far fa-circle-notch fa-spin" />
          ) : (
            <BigNumberValue value={minimumReceived} decimals={lpToken.decimals} />
          )}
        </Value>
      </InfoList>

      <Button disabled={disabled} block onClick={showConfirm}>
        {buttonText}
      </Button>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 10px 26px 38px 26px;
  background-color: #ffffff;
  margin-bottom: 20px;
  ${screenUp('lg')`
    margin-bottom: 0px;
  `}
`;

const InfoList = styled(TwoColumnGrid)`
  padding-bottom: 30px;
  padding-top: 15px;
  ${screenUp('lg')`
    padding-top: 0px;
  `}
`;
