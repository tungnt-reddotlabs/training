import React from 'react';
import styled from 'styled-components';
import { useToken } from '../../../hooks/useToken';
import { screenUp } from '../../../utils/styles';
import VaulButtonClaimReward from './VaultButtonClaimReward';
import { VaulPoolConfig } from '../../../models/Vault';
import { BigNumber } from '@ethersproject/bignumber';
import { BigNumberValue } from '../../../components/BigNumberValue';
import VaultButtonCompound from './VaultButtonCompound';
import Spacer from '../../../components/Spacer';

export type VaulItemRewardProps = {
  poolConfig: VaulPoolConfig;
  pendingReward: BigNumber;
};

const VaulItemReward: React.FC<VaulItemRewardProps> = ({ poolConfig, pendingReward }) => {
  const rewardTokenInfo = useToken(poolConfig?.rewardToken);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>Rewards</StyledTitle>
      </StyledHeader>
      <StyledControl>
        <StyledEarnInfo>
          <StyledInfo>
            {rewardTokenInfo?.symbol}
            <div className="value">
              <BigNumberValue
                value={pendingReward}
                decimals={rewardTokenInfo?.decimals}
                fractionDigits={2}
                keepCommas
              />
            </div>
          </StyledInfo>
        </StyledEarnInfo>
        <StyledActions>
          <VaulButtonClaimReward pool={poolConfig} />
          <Spacer size="sm" />
          <VaultButtonCompound pool={poolConfig}></VaultButtonCompound>
        </StyledActions>
      </StyledControl>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

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

const StyledControl = styled.div`
  background-color: #e5e7ef;
  padding: 20px 12px;
  ${screenUp('lg')`
     padding: 20px 17px;
  `}
`;

const StyledEarnInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledInfo = styled.div`
  margin-left: 13px;
  margin-right: auto;
  font-size: 14px;
  font-weight: normal;
  color: #555a71;
  .value {
    font-size: 18px;
    font-weight: bold;
    color: #070a10;
  }
`;

const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default VaulItemReward;
