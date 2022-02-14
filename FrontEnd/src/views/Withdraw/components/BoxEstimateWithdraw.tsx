import { BigNumber } from '@ethersproject/bignumber';
import React, { useEffect } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { TokenSymbol } from '../../../components/TokenSymbol';
import useDebounce from '../../../hooks/useDebounce';
import { usePoolContract } from '../../../hooks/usePoolContract';
import { useCurrentPool, useCurrentPoolAssets, usePool } from '../../../state/stablepool/hooks';
import { Button } from '../../../components/Buttons';
import { ButtonSelectOutputAsset } from './ButtonSelectOutputAsset';
import { useMemo } from 'react';
import useModal from '../../../hooks/useModal';
import { ModalConfirmWithdraw } from './ModalConfirmWithdraw';
import {
  BonusPrecision,
  ImpactPrecision,
  Precision,
  PricePrecision,
} from '../../../utils/constants';
import { parseUnits } from '@ethersproject/units';
import { Zero } from '@ethersproject/constants';
import { sum } from '../../../utils/numbers';
import { TwoColumnGrid, Label, Value } from '../../PoolDetail/components/Share';
import { useUserToken } from '../../../state/user/hooks';
import { useSwapRouter } from '../../../hooks/useSwapRouter';
import { zipObject } from 'lodash';
import { Toggle } from '../../../components/Toggle';
import { screenUp } from '../../../utils/styles';

export type BoxEstimatedWithdrawProps = {
  input: BigNumber;
  onConfirmed: () => void;
  requireApproval: (address: string) => void;
  useBasePoolToken?: boolean;
  onToggle?: (isToggle: boolean) => void;
};

const impactThreshold = parseUnits('2', 8);

export const BoxEstimateWithdraw: React.FC<BoxEstimatedWithdrawProps> = ({
  input,
  onConfirmed,
  requireApproval,
  useBasePoolToken,
  onToggle,
}) => {
  const pool = useCurrentPool();
  const poolContract = usePoolContract(pool?.address);
  const inputDebounced = useDebounce(input, 200);
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const [estimatedOutput, setEstimatedOutput] = useState<BigNumber[]>([]);
  const [singleOutput, setSingleOutput] = useState(false);
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  const [impact, setImpact] = useState<BigNumber>();
  const [bonus, setBonus] = useState<BigNumber>();
  const lpToken = useUserToken(pool?.lpToken);
  const swapRouter = useSwapRouter();
  const basePool = usePool(pool?.basePool);

  useEffect(() => {
    if (!pool) {
      return;
    }
    if (!basePool || useBasePoolToken) {
      requireApproval(pool.address);
      return;
    }

    if (!singleOutput) {
      requireApproval(swapRouter.address);
      return;
    }

    const symbol = assets[selectedOutputIndex].symbol;
    if (basePool.assets.includes(symbol)) {
      requireApproval(swapRouter.address);
    } else {
      requireApproval(pool.address);
    }
  }, [
    singleOutput,
    basePool,
    selectedOutputIndex,
    assets,
    requireApproval,
    pool,
    swapRouter,
    useBasePoolToken,
  ]);

  const estimateAllAssetsPlain = useCallback(
    async (input: BigNumber) => {
      const res = (await poolContract.calculateRemoveLiquidity(input)) as BigNumber[];
      return res;
    },
    [poolContract],
  );

  /**
   * @param index index of token in pools
   * @param assetIndex index of token in assets array
   */
  const estimateSingleAssetPlain = useCallback(
    async (input: BigNumber, index: number, assetIndex: number) => {
      const output: BigNumber[] = [];
      output[assetIndex] = (await poolContract.calculateRemoveLiquidityOneToken(
        input,
        index,
      )) as BigNumber;
      return output;
    },
    [poolContract],
  );

  const estimateAllAssetsMeta = useCallback(
    async (input: BigNumber) => {
      if (!basePool) {
        throw new Error('Invalid function call');
      }

      const [metaAmounts, baseAmounts] = (await swapRouter.calculateRemoveLiquidity(
        pool.address,
        basePool.address,
        input,
      )) as [BigNumber[], BigNumber[]];

      const amountMap = {
        ...zipObject(basePool.assets, baseAmounts),
        ...zipObject(pool.assets, metaAmounts),
      };

      return assets.map((t) => amountMap[t.symbol]);
    },
    [basePool, pool, swapRouter, assets],
  );

  const estimateSingleAssetMeta = useCallback(
    async (input: BigNumber, baseIndex: number, index) => {
      if (!basePool) {
        throw new Error('Invalid function call');
      }

      const output: BigNumber[] = [];
      output[index] = (await swapRouter.calculateRemoveBaseLiquidityOneToken(
        pool.address,
        basePool.address,
        input,
        baseIndex,
      )) as BigNumber;
      return output;
    },
    [swapRouter, basePool, pool],
  );

  const calculateImpact = useCallback(
    (input: BigNumber, totalOutput: BigNumber) => {
      if (!input || input.eq(0)) {
        return {};
      }
      const newVirtualPrice = pool.virtualPrice
        .mul(pool.totalSupply)
        .sub(totalOutput.mul(PricePrecision))
        .div(pool.totalSupply.sub(input));

      const totalInput = newVirtualPrice.mul(input).div(parseUnits('1', 18));
      const impact = totalInput.gt(totalOutput)
        ? totalInput.sub(totalOutput).mul(Precision).div(totalInput)
        : null;
      const bonus = totalOutput.gte(totalInput)
        ? totalOutput.sub(totalInput).mul(Precision).div(totalInput)
        : null;
      return { impact, bonus };
    },
    [pool],
  );

  const selectedOutput = useMemo(() => {
    return assets && selectedOutputIndex != null ? assets[selectedOutputIndex] : null;
  }, [assets, selectedOutputIndex]);

  useEffect(() => {
    if (!inputDebounced) {
      setImpact(null);
      setBonus(null);
      setEstimatedOutput([]);
      return;
    }

    let mounted = true;

    let output$: Promise<BigNumber[]>;
    switch (true) {
      case singleOutput && (!basePool || useBasePoolToken):
        output$ = estimateSingleAssetPlain(
          inputDebounced,
          selectedOutputIndex,
          selectedOutputIndex,
        );
        break;
      case !singleOutput && (!basePool || useBasePoolToken):
        output$ = estimateAllAssetsPlain(inputDebounced);
        break;
      case !singleOutput && !!basePool:
        output$ = estimateAllAssetsMeta(inputDebounced);
        break;
      case singleOutput && !!basePool: {
        const outputSymbol = assets[selectedOutputIndex].symbol;
        const baseIndex = basePool.assets.indexOf(outputSymbol);

        if (baseIndex === -1) {
          const index = pool.assets.indexOf(outputSymbol);
          output$ = estimateSingleAssetPlain(inputDebounced, index, selectedOutputIndex);
        } else {
          output$ = estimateSingleAssetMeta(inputDebounced, baseIndex, selectedOutputIndex);
        }
        break;
      }
    }

    output$
      .then((output) => {
        if (!mounted) {
          return;
        }

        setEstimatedOutput(output);
        const _totalOutput = assets
          .map((t, i) => output[i]?.mul(parseUnits('1', 18 - t.decimals)) || Zero)
          .reduce(sum, Zero);
        const priceImpact = calculateImpact(inputDebounced, _totalOutput);
        setImpact(priceImpact.impact);
        setBonus(priceImpact.bonus);
      })
      .catch((e) => {
        console.warn(e);
        if (mounted) {
          setImpact(null);
          setBonus(null);
          setEstimatedOutput([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [
    assets,
    basePool,
    calculateImpact,
    estimateAllAssetsMeta,
    estimateAllAssetsPlain,
    estimateSingleAssetMeta,
    estimateSingleAssetPlain,
    inputDebounced,
    pool,
    selectedOutputIndex,
    singleOutput,
    useBasePoolToken,
  ]);

  const [showConfirm] = useModal(
    <ModalConfirmWithdraw
      input={inputDebounced}
      singleOutput={singleOutput}
      outputIndex={selectedOutputIndex}
      estimatedOutput={estimatedOutput}
      onConfirmed={onConfirmed}
      useBasePoolToken={useBasePoolToken}
    />,
  );

  const insufficientBalance = useMemo(() => {
    return input?.gt(lpToken.balance);
  }, [input, lpToken]);

  const buttonText = useMemo(() => {
    if (insufficientBalance) return 'Insufficient balance';
    return 'Withdraw';
  }, [insufficientBalance]);

  const disabled = useMemo(() => {
    return insufficientBalance || !input || input.eq(0);
  }, [input, insufficientBalance]);

  return (
    <StyledBox>
      <BoxHeader>
        Receive
        <div className="right">
          {onToggle ? (
            <StyledSelectBasePool>
              <Toggle checked={useBasePoolToken} onChange={onToggle}>
                &nbsp;Use 1S3P
              </Toggle>
            </StyledSelectBasePool>
          ) : null}
          {onToggle && <div className="line" />}
          <span>
            <ButtonSelectOutputAsset
              selected={singleOutput ? selectedOutputIndex : -1}
              onSelect={setSelectedOutputIndex}
              onUseSingleOutput={setSingleOutput}
              useBasePoolToken={useBasePoolToken}
            />
          </span>
        </div>
      </BoxHeader>
      <BoxContent>
        {singleOutput ? (
          <TokenRow>
            <TokenSymbol symbol={selectedOutput.symbol} size={36} />
            <RowLabel>
              {selectedOutput.symbol}
              <div className="balance">
                Balance:{' '}
                <BigNumberValue
                  value={selectedOutput.balance}
                  decimals={selectedOutput.decimals}
                  fractionDigits={2}
                />
              </div>
            </RowLabel>
            {selectedOutput ? (
              <TokenValue>
                {input?.gt(Zero) && !estimatedOutput[selectedOutputIndex] ? (
                  <i className="far fa-circle-notch fa-spin" />
                ) : (
                  <BigNumberValue
                    decimals={selectedOutput?.decimals}
                    value={estimatedOutput[selectedOutputIndex]}
                  />
                )}
              </TokenValue>
            ) : null}
          </TokenRow>
        ) : (
          <>
            {(assets || []).map((t, i) => (
              <TokenRow key={t.symbol}>
                <TokenSymbol symbol={t.symbol} size={36} />
                <RowLabel>
                  {t.symbol}
                  <div className="balance">
                    Balance:{' '}
                    <BigNumberValue
                      value={t.balance}
                      decimals={t.decimals}
                      fractionDigits={2}
                    />
                  </div>
                </RowLabel>
                <TokenValue>
                  {input?.gt(Zero) && !estimatedOutput[i] ? (
                    <i className="far fa-circle-notch fa-spin" />
                  ) : (
                    <BigNumberValue decimals={t.decimals} value={estimatedOutput[i]} />
                  )}
                </TokenValue>
              </TokenRow>
            ))}
          </>
        )}
      </BoxContent>
      <InfoList>
        <>
          <Label>
            {impact ? 'Price impact' : 'Bonus'}
            {/* <Tooltip content="Bonus might come when<br/>withdrawing tokens with more liquidity" /> */}
          </Label>
          {impact ? (
            <Value variant={impact.gt(impactThreshold) ? 'danger' : 'normal'}>
              {impact && impact?.gte(ImpactPrecision) ? '-' : ''}
              {input?.gt(Zero) && !impact ? (
                <i className="far fa-circle-notch fa-spin" />
              ) : (
                <BigNumberValue value={impact} decimals={10} percentage fractionDigits={4} />
              )}
            </Value>
          ) : (
            <Value variant="success">
              {bonus && bonus?.gte(BonusPrecision) ? '+' : ''}
              {input?.gt(Zero) && !bonus ? (
                <i className="far fa-circle-notch fa-spin" />
              ) : (
                <BigNumberValue value={bonus} decimals={10} percentage fractionDigits={4} />
              )}
            </Value>
          )}
        </>
      </InfoList>
      <Button onClick={showConfirm} block disabled={disabled}>
        {buttonText}
      </Button>
    </StyledBox>
  );
};

const StyledBox = styled.div``;

const StyledSelectBasePool = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #555a71;
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

const BoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  color: #070a10;
  .right {
    display: flex;
    align-items: center;
    justify-content: center;
    .line {
      margin: 0px 5px;
      width: 1px;
      height: 15px;
      background-color: #afb7ce;
    }
  }
  ${screenUp('lg')`
    .right {
      .line {
        margin: 0px 10px;
      }
    }
  `}
`;

const BoxContent = styled.div`
  margin-top: 12px;
  padding: 10px 18px;
  border-radius: 3px;
  border: solid 1px #d4d9e5;
`;

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 0px;
  :not(:last-child) {
    border-bottom: 1px dashed #d4d9e5;
  }
`;

const RowLabel = styled.div`
  margin-left: 8px;
  font-size: 16px;
  font-weight: normal;
  color: #070a10;
  .balance {
    font-size: 12px;
    font-weight: normal;
    color: #555a71;
  }
`;

export const TokenValue = styled.div`
  margin-left: auto;
  font-size: 20px;
  font-weight: bold;
  color: #3085b1;
  i {
    font-size: 16px;
  }
`;

const InfoList = styled(TwoColumnGrid)`
  margin: 18px 0px 32px 0px;
`;
