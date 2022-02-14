import { Zero } from '@ethersproject/constants';
import { parseUnits } from '@ethersproject/units';
import React from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { useCurrentPool, useCurrentPoolLiquidity } from '../../../state/stablepool/hooks';
import {
  StyledBox,
  StyledBoxHeader,
  StyledBoxContent,
  TwoColumnGrid,
  Label,
  Value,
} from './Share';
export const PoolInfo: React.FC = () => {
  const pool = useCurrentPool();
  const assets = useCurrentPoolLiquidity();

  const total = useMemo(() => {
    return assets.reduce((acc, item) => {
      // normalize balance to 18 decimals
      return item.poolBalance
        ? acc.add(item.poolBalance.mul(parseUnits('1', 18 - item.decimals))) || Zero
        : acc;
    }, Zero);
  }, [assets]);

  const tokenRatios = useMemo(() => {
    if (!pool || pool.totalSupply?.eq(0)) {
      return [];
    }
    return assets.map(
      (t) =>
        t.poolBalance
          ?.mul(parseUnits('1', 18 - t.decimals || 0))
          ?.mul(1e6)
          ?.div(total) || Zero,
    );
  }, [assets, total, pool]);

  return (
    <StyledContainer>
      <StyledBox>
        <StyledBoxHeader>Pool Info</StyledBoxHeader>
        <StyledBoxContent>
          {(assets || []).map((t, index) => (
            <StyledItem key={t.symbol}>
              <span className="field">
                <TokenSymbol symbol={t.symbol} size={28} />
                {t.symbol}
              </span>
              <span className="value">
                <BigNumberValue
                  value={t.poolBalance}
                  decimals={t.decimals}
                  fractionDigits={0}
                />
                &nbsp;(
                <BigNumberValue
                  value={tokenRatios[index]}
                  decimals={6}
                  percentage
                  fractionDigits={2}
                />
                )
              </span>
            </StyledItem>
          ))}
          <StyledTotal>
            <InfoList>
              <Label>Total Liquidity</Label>
              <Value>
                <BigNumberValue value={total} decimals={18} fractionDigits={0} />
              </Value>
              <Label>Virtual Price</Label>
              <Value>
                <BigNumberValue value={pool?.virtualPrice} decimals={18} fractionDigits={6} />
              </Value>
              <Label>A</Label>
              <Value>
                <BigNumberValue value={pool?.a} decimals={0} fractionDigits={6} />
              </Value>
              <Label>Swap Fee</Label>
              <Value>
                <BigNumberValue
                  value={pool?.fee}
                  decimals={10}
                  fractionDigits={2}
                  percentage={true}
                />
              </Value>
            </InfoList>
          </StyledTotal>
          {pool?.id === '1s3pavaxusd' && (
            <StyledBridge>
              Bridge USDC.e, USDT.e, DAI.e tokens from{' '}
              <a
                target="_blank"
                href={'https://app.relaychain.com/#/cross-chain-bridge-transfer'}
              >
                RelayChain
              </a>
            </StyledBridge>
          )}
          {pool?.id === '1s3pwanusd' && (
            <StyledBridge>
              USDC.m, USDT.m are Wanchain's bridge tokens which can be purchased from{' '}
              <a target="_blank" href={'https://www.huckleberry.finance/'}>
                Huckleberry
              </a>
            </StyledBridge>
          )}
        </StyledBoxContent>
      </StyledBox>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  .field {
    font-size: 14px;
    font-weight: normal;
    color: #555a71;
    display: flex;
    align-items: center;
    img {
      object-fit: contain;
      margin-right: 8px;
    }
  }
  .value {
    margin-left: auto;
    font-size: 14px;
    font-weight: normal;
    color: #070a10;
  }
  :not(:last-child) {
    margin-bottom: 24px;
  }
`;

const StyledTotal = styled.div`
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px dashed #acb7d0;
`;

const StyledBridge = styled.div`
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #acb7d0;
  font-size: 12px;
  font-weight: normal;
  color: #070a10;
  a {
    color: #3085b1;
    :hover {
      text-decoration: underline;
    }
  }
`;

const InfoList = styled(TwoColumnGrid)``;
