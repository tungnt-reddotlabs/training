import { Zero } from '@ethersproject/constants';
import differenceInDays from 'date-fns/differenceInDays';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { SecsDisplayValue } from '../../../components/SecsDisplayValue';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { useStakingVault } from '../../../state/staking/hooks';
import { screenUp } from '../../../utils/styles';
import StakingItemDeposit from './StakingItemDeposit';
import StakingItemWithdraw from './StakingItemWithdraw';
import StakingItemLock from './StakingItemLock';

export type StakingItemProps = {
  index: number;
  expanded: boolean;
  vaultAddress: string;
  toggle: (index: number) => void;
};

const StakingItem: React.FC<StakingItemProps> = ({ index, vaultAddress, expanded, toggle }) => {
  const vault = useStakingVault(vaultAddress);
  const userInfo = vault?.userInfo;
  const vaultInfo = vault?.vaultInfo;

  const lockup = useMemo(() => {
    if (!vaultInfo?.startLockTime || !vaultInfo?.endLockTime) {
      return;
    }
    return differenceInDays(
      new Date(vaultInfo?.endLockTime * 1000),
      new Date(vaultInfo?.startLockTime * 1000),
    );
  }, [vaultInfo?.endLockTime, vaultInfo?.startLockTime]);

  const rewardPerDay = useMemo(() => {
    if (!vaultInfo?.rewardPerSecond) {
      return;
    }
    return vaultInfo?.rewardPerSecond?.mul(86400);
  }, [vaultInfo?.rewardPerSecond]);

  const apr = useMemo(() => {
    if (!rewardPerDay || !vaultInfo?.totalStaked) {
      return;
    }
    if (vaultInfo?.totalStaked?.eq(Zero)) {
      return Zero;
    }
    return rewardPerDay.mul(365)?.mul(1e6).div(vaultInfo?.totalStaked);
  }, [rewardPerDay, vaultInfo?.totalStaked]);

  const expandRow = useCallback(() => {
    if (!expanded) {
      toggle(index);
    }
  }, [expanded, toggle, index]);

  const toggleRow = useCallback(
    ($event) => {
      toggle(index);
      $event.preventDefault();
      $event.stopPropagation();
    },
    [toggle, index],
  );

  return (
    <StyledContainer isExpand={expanded} onClick={expandRow}>
      <StyledHeader>
        <StyledStakeToken>
          <TokenSymbol symbol={vault?.vaultConfig?.wantSymbol} size={46} />
          <div>
            <StyledSymbol>{vault?.vaultConfig?.wantSymbol}</StyledSymbol>
            <StyledReward>
              <BigNumberValue value={rewardPerDay} decimals={18} fractionDigits={0} />
              &nbsp;
              {vault?.vaultConfig?.wantSymbol} per day
            </StyledReward>
          </div>
        </StyledStakeToken>
        <StyledRow>
          <StyledLine>
            <StyledMobileTitle>Lockup</StyledMobileTitle>
            <StyledValue>{lockup !== undefined ? `${lockup} days` : '-'}</StyledValue>
          </StyledLine>
          <div>
            {vaultInfo?.startLockTime && (
              <StyledText>
                Start:
                <span>
                  <SecsDisplayValue
                    secs={vaultInfo?.startLockTime || 0}
                    formatter="MMM d, yyyy HH:mm O"
                  />
                </span>
              </StyledText>
            )}
            {vaultInfo?.endLockTime && (
              <StyledText>
                End:
                <span>
                  <SecsDisplayValue
                    secs={vaultInfo?.endLockTime || 0}
                    formatter="MMM d, yyyy HH:mm O"
                  />
                </span>
              </StyledText>
            )}
          </div>
        </StyledRow>
        <StyledRow>
          <StyledLine>
            <StyledMobileTitle>Staked</StyledMobileTitle>
            <StyledValue>
              {userInfo?.amount?.gt(Zero) ? (
                <BigNumberValue value={userInfo?.amount} decimals={18} fractionDigits={3} />
              ) : (
                '-'
              )}
            </StyledValue>
          </StyledLine>
        </StyledRow>
        <StyledRow>
          <StyledLine>
            <StyledMobileTitle>TVL</StyledMobileTitle>
            <StyledValue>
              {vaultInfo?.totalStaked?.gt(Zero) ? (
                <BigNumberValue
                  value={vaultInfo?.totalStaked}
                  decimals={18}
                  fractionDigits={0}
                />
              ) : (
                '-'
              )}
            </StyledValue>
          </StyledLine>
        </StyledRow>
        <StyledRow>
          <StyledLine>
            <StyledMobileTitle>Limit</StyledMobileTitle>
            <StyledValue>
              <BigNumberValue value={vaultInfo?.maxCap} decimals={18} fractionDigits={0} />
            </StyledValue>
          </StyledLine>
        </StyledRow>
        <StyledRow>
          <StyledLine>
            <StyledMobileTitle>APR</StyledMobileTitle>
            <StyledValue>
              <BigNumberValue value={apr} decimals={6} percentage fractionDigits={0} />
            </StyledValue>
          </StyledLine>
        </StyledRow>
        <StyledButton onClick={toggleRow} expanded={expanded}>
          {expanded ? (
            <i className="fal fa-chevron-down" />
          ) : (
            <i className="fal fa-chevron-up" />
          )}
        </StyledButton>
      </StyledHeader>
      <StyledContent isExpand={expanded}>
        <StyledControl>
          <StakingItemDeposit vaultAddress={vault?.vaultConfig?.address} />
          <StakingItemWithdraw vaultAddress={vault?.vaultConfig?.address} />
          <StakingItemLock vaultAddress={vault?.vaultConfig?.address} />
        </StyledControl>
      </StyledContent>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ isExpand?: boolean }>`
  width: 100%;
  cursor: ${({ isExpand }) => (isExpand ? 'auto' : 'pointer')};
  position: relative;
  background: transparent;
  margin-bottom: 12px;
  overflow: hidden;
  background-color: #fff;
  ${screenUp('lg')`
  `}
`;

const StyledHeader = styled.div`
  display: block;
  padding: 16px 14px;
  ${() => screenUp('lg')`
    padding: 18px 24px;
    display: grid;
    align-items: center;
    grid-template-columns: 7fr 8fr 4fr 4fr 4fr 3fr 1fr;
    grid-gap: 10px;
  `}
`;

const StyledStakeToken = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  img {
    margin-right: 12px;
    margin-bottom: auto;
  }
  ${screenUp('lg')`
    margin-bottom: 0px;
  `}
`;

const StyledSymbol = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #070a10;
`;

const StyledReward = styled.div`
  font-size: 12px;
  font-weight: normal;
  color: #545866;
  padding-top: 4px;
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 6px;
  ${screenUp('lg')`
    flex-direction: column;
    margin-bottom: 0px;
  `}
`;

const StyledLine = styled.div`
  display: flex;
  align-items: center;
`;

const StyledMobileTitle = styled.div`
  font-size: 13px;
  font-weight: normal;
  color: #555a71;
  margin-right: auto;
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledValue = styled.div<{ highlight?: boolean }>`
  font-size: 14px;
  font-weight: bold;
  color: ${({ highlight }) => (highlight ? '#3085b1' : '#070a10')};
  .symbol {
    margin-left: 5px;
    font-size: 12px;
    color: #555a71;
  }
  .sub-value {
    margin-left: 5px;
    font-size: 12px;
    color: #999;
    font-weight: 600;
  }
  ${screenUp('lg')`
    font-size: 14px;
  `}
`;

const StyledText = styled.div`
  display: flex;
  font-size: 12px;
  color: #7a7f94;
  :not(:last-child) {
    margin-bottom: 8px;
  }
  span {
    margin-left: auto;
    color: #545866;
  }
  :not(:last-child) {
    padding-top: 4px;
  }
  ${screenUp('lg')`
    span {
      margin-left: 2px;
      color: #545866;
    }
    :not(:last-child) {
      margin-bottom: 0px;
    }
  `}
`;

const StyledButton = styled.button<{ expanded?: boolean }>`
  margin-left: auto;
  width: 26px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  display: none;
  i {
    font-size: 15px;
    color: #555a71;
  }
  ${screenUp('lg')`
    display: block;
  `}
`;

const StyledContent = styled.div<{ isExpand?: boolean }>`
  border-top: 1px dashed #acb7d0;
  padding: 14px;
  transition: all 0.2s ease;
  transform-origin: top;
  display: ${({ isExpand }) => (isExpand ? 'grid' : 'none')};
  ${screenUp('lg')`
    padding: 25px;
  `}
`;

const StyledControl = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 20px;
  ${screenUp('lg')`
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr;
  `}
`;

export default StakingItem;
