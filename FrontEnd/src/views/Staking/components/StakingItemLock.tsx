import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useStakingVault } from '../../../state/staking/hooks';
import { screenUp } from '../../../utils/styles';
import { VaultStatus } from '../../../models/StakingVault';
import { StakingItemCountdown } from './StakingItemCountdown';
import iconTimer from '../../../assets/icons/timer.svg';
import iconVaultFinished from '../../../assets/images/img-staking-lock-finished.png';
import { useStakingVaultStatus } from '../hooks/useStakingVaultStatus';

interface StakingItemLockProps {
  vaultAddress: string;
}

const StakingItemLock: React.FC<StakingItemLockProps> = ({ vaultAddress }) => {
  const vault = useStakingVault(vaultAddress);
  const vaultInfo = vault?.vaultInfo;
  const vaultStatus = useStakingVaultStatus(vaultAddress);

  const vaultLoading = useMemo(() => {
    return vaultStatus === undefined;
  }, [vaultStatus]);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>
          <i className="far fa-lock-alt"></i>&nbsp;Lock
        </StyledTitle>
      </StyledHeader>
      <StyledContent>
        {vaultLoading ? (
          <StyledLoadingContainer>
            <i className="fal fa-spinner-third fa-spin fa-2x text-muted"></i>
          </StyledLoadingContainer>
        ) : (
          <>
            {vaultStatus === VaultStatus.notStated && (
              <StyledCountdown>
                <div className="header">
                  <img src={iconTimer} />
                  Start in
                </div>
                <StakingItemCountdown to={vaultInfo?.startLockTime} />
              </StyledCountdown>
            )}
            {vaultStatus === VaultStatus.locked ? (
              <StyledCountdown>
                <div className="header">
                  <img src={iconTimer} />
                  Available to unstake
                </div>
                <StakingItemCountdown to={vaultInfo?.endLockTime} />
              </StyledCountdown>
            ) : null}
            {vaultStatus === VaultStatus.finished ? (
              <VaultFinished>
                <img src={iconVaultFinished} />
                <span>Vault was expired</span>
              </VaultFinished>
            ) : null}
          </>
        )}
      </StyledContent>
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

const StyledContent = styled.div`
  flex: 1;
  background-color: #e5e7ef;
  padding: 20px 12px;
  ${screenUp('lg')`
     padding: 20px 17px;
  `}
`;

const StyledCountdown = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: normal;
    color: #555a71;
    padding-bottom: 20px;
    img {
      margin-right: 8px;
      width: 21px;
    }
  }
`;

const VaultFinished = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 46px;
  }
  span {
    padding-top: 12px;
    font-size: 14px;
    font-weight: normal;
    color: #555a71;
  }
`;

export default StakingItemLock;
