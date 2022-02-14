import React, { useCallback, useState } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { useStakingVaults } from '../../state/staking/hooks';
import { useWatchTokenBalance } from '../../state/user/hooks';
import { screenUp } from '../../utils/styles';
import StakingItem from './components/StakingItem';
import imgStaking from '../../assets/images/img-staking.png';
import { useMemo } from 'react';

const Staking: React.FC = () => {
  const stakingVaults = useStakingVaults();
  const watchToken = useWatchTokenBalance();
  const [expanded, setExpanded] = useState(-1);

  useEffect(() => {
    if (!stakingVaults) {
      return;
    }
    const tokens = stakingVaults.map((t) => t.vaultConfig.wantSymbol);
    watchToken(tokens);
  }, [watchToken, stakingVaults]);

  const activeStakingVaults = useMemo(() => {
    return stakingVaults?.filter((s) => !s.vaultConfig.inActive);
  }, [stakingVaults]);

  const inActiveStakingVaults = useMemo(() => {
    return stakingVaults?.filter((s) => s.vaultConfig.inActive);
  }, [stakingVaults]);

  const toggle = useCallback((index: number) => {
    setExpanded((t) => {
      return t === index ? -1 : index;
    });
  }, []);

  return (
    <StyledContainer>
      <StyledRole>
        <div className="title">Staking</div>
        <ul className="des">
          <li>You must deposit 1SWAP tokens before staking starts</li>
          <li>
            When staking starts you can not: deposit more 1SWAP, claim any rewards or withdraw
            your deposit early
          </li>
          <li>When staking ends you can claim the rewards and withdraw your deposit</li>
          <li>
            Read more information on:{' '}
            <a href="https://docs.1swap.fi/" target="_blank">
              https://docs.1swap.fi/
            </a>
          </li>
        </ul>
      </StyledRole>
      <StyledLabels>
        <StyledTitle>Stake</StyledTitle>
        <StyledTitle>Lockup</StyledTitle>
        <StyledTitle>My Staked</StyledTitle>
        <StyledTitle>TVL</StyledTitle>
        <StyledTitle>Limit</StyledTitle>
        <StyledTitle>APR</StyledTitle>
      </StyledLabels>
      <StyledContent>
        {(activeStakingVaults || []).map((v, index) => (
          <StakingItem
            key={index}
            index={index}
            expanded={expanded === index}
            toggle={toggle}
            vaultAddress={v?.vaultConfig?.address}
          />
        ))}
      </StyledContent>
      {inActiveStakingVaults?.length ? (
        <StyledInactiveContainer>
          <div className="title">Inactive Vault</div>
          <div className="content">
            {(inActiveStakingVaults || []).map((v, index) => (
              <StakingItem
                key={index}
                index={index}
                expanded={expanded === index}
                toggle={toggle}
                vaultAddress={v?.vaultConfig?.address}
              />
            ))}
          </div>
        </StyledInactiveContainer>
      ) : null}
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;

const StyledRole = styled.div`
  position: relative;
  padding: 21px 25px;
  background-color: #133a53;
  margin-bottom: 36px;
  .title {
    padding-bottom: 14px;
    font-size: 22px;
    font-weight: bold;
    color: #fff;
  }
  ul {
    color: #d7dae5;
    list-style: circle;
    padding-left: 20px;
    margin: 0;
    font-size: 14px;
  }
  a {
    color: #d7dae5;
    text-decoration: underline;
    &:hover {
      color: #fafafa;
    }
  }
  ::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 60%;
    background-image: url(${imgStaking});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  ${screenUp('lg')`
    ::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      left: -10px;
      width: 100%;
      height: 60%;
      background-image: url(${imgStaking});
      background-size: contain;
      background-repeat: no-repeat;
      background-position: right;
    }
  `}
`;

const StyledLabels = styled.div`
  display: none;
  ${screenUp('lg')`
    padding: 0 24px 10px;
    display: grid;
    align-items: center;
    grid-template-columns:  7fr 8fr 4fr 4fr 4fr 3fr 1fr;
    grid-gap: 10px;
  `}
`;

const StyledTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

const StyledContent = styled.div``;

const StyledInactiveContainer = styled.div`
  padding-top: 30px;
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    padding-bottom: 14px;
  }
  .content {
    filter: grayscale(100%) brightness(85%);
    -webkit-filter: grayscale(100%) brightness(85%);
    -moz-filter: grayscale(100%) brightness(85%);
  }
`;

export default Staking;
