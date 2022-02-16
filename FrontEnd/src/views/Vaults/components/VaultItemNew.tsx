import React from 'react';
import styled from 'styled-components';
import VaulDeposit from './VaultDeposit';
import VaulWithdraw from './VaultWithdraw';
import { screenUp } from '../../../utils/styles';
import { VaultingPoolInfo } from '../../../models/Vault';
import VaulItemReward from './VaultItemReward';
import { useMemo } from 'react';
import {
  CollapseBody,
  CollapseButton,
  CollapseClose,
  CollapseItem,
  CollapseOpen,
} from '../../../components/Collapse';

export type VaulItemProps = {
  index: number;
  pool: VaultingPoolInfo;
};

const VaulItem: React.FC<VaulItemProps> = ({ index, pool }) => {
  const userPoolInfo = pool?.userInfo;
  const vaulName = useMemo(() => {
    return pool?.poolConfig?.name
      ? pool?.poolConfig?.name
      : `${pool?.poolConfig?.wantTokens[0]}${pool?.poolConfig?.wantTokens[1] ? '/' + pool?.poolConfig?.wantTokens[1] : ''
      }`;
  }, [pool?.poolConfig?.name, pool?.poolConfig?.wantTokens]);


  return (
    <StyledContainer>
      <CollapseItem id={index}>
        <StyledHeader>
          <StyledVaulToken>
            <div>
              <StyledSymbol>{vaulName}</StyledSymbol>
              <StyledReward>
                {pool?.poolConfig?.rewardPerDay ? (
                  pool?.poolConfig?.rewardPerDay
                ) : (
                  '-'
                )}
                &nbsp;
                {pool?.poolConfig?.rewardToken} per day
              </StyledReward>
            </div>
          </StyledVaulToken>
          <CollapseButton id={index}>
            <StyledButton>
              <CollapseOpen id={index}>
                <i className="fal fa-chevron-down" />
              </CollapseOpen>
              <CollapseClose id={index}>
                <i className="fal fa-chevron-up" />
              </CollapseClose>
            </StyledButton>
          </CollapseButton>
        </StyledHeader>
      </CollapseItem>
      <CollapseBody id={index}>
        <StyledContent>
          {!pool?.poolConfig?.coming && (
            <>
              <VaulDeposit
                pool={pool?.poolConfig}
              />
              <VaulWithdraw
                pool={pool}
              />
              <VaulItemReward
                poolConfig={pool?.poolConfig}
                pendingReward={userPoolInfo?.pendingReward}
              />
            </>
          )}
        </StyledContent>
      </CollapseBody>
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
  padding: 0px 12px;
  background-color: #fff;
  ${screenUp('lg')`
     padding: 0px 24px;
  `}
`;

const StyledHeader = styled.div<{ coming?: boolean }>`
  display: block;
  padding: 22px 0px;
  ${() => screenUp('lg')`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `}
`;

const StyledVaulToken = styled.div`
  display: flex;
  img {
    width: 100px;
    object-fit: contain;
    margin-right: 12px;
  }
  border-bottom: 1px solid #2c3648;
  padding-bottom: 20px;
  ${screenUp('lg')`
    border-bottom: none;
    padding-bottom: 0px;
  `}
`;

const StyledSymbol = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: #070a10;
`;

const StyledReward = styled.div`
  font-size: 12px;
  font-weight: normal;
  color: #555a71;
  padding-top: 8px;
`;

const StyledButton = styled.div`
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

const StyledContent = styled.div`
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 20px;
  border-top: 1px dashed #acb7d0;
  padding: 22px 0px 34px 0px;
  transition: all 0.2s ease;
  transform-origin: top;
  display: grid;
  ${screenUp('lg')`
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr;
  `}
`;

export default VaulItem;
