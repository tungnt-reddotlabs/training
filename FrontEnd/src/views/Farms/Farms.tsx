import React, { useState } from 'react';
import styled from 'styled-components';
import { Countdown } from '../../components/Countdown';
import { useFarmingPools } from '../../state/farms/hooks';
import FarmItem from './components/FarmItemNew';
import ImgCountdown from '../../assets/images/farm-countdown.svg';
import { isPast } from '../../utils/times';
import { useEffect } from 'react';
import { useWatchTokenBalance } from '../../state/user/hooks';
import { useMemo } from 'react';
import FarmHarvestAll from './components/FarmHarvestAll';
import { useWeb3React } from '@web3-react/core';
import { screenUp } from '../../utils/styles';
import { Collapse } from '../../components/Collapse';

const Farms: React.FC = () => {
  const { account } = useWeb3React();
  const start = 0;
  const pools = useFarmingPools();
  const [started, setStarted] = useState<boolean>(isPast(start));

  const corePools = useMemo(() => {
    return pools?.filter((p) => !p?.poolConfig?.farmUrl);
  }, [pools]);

  const activeFarms = useMemo(() => {
    return corePools?.filter((s) => !s.poolConfig.inactive);
  }, [corePools]);

  const inActiveFarms = useMemo(() => {
    return corePools?.filter((s) => s.poolConfig.inactive);
  }, [corePools]);

  const watchToken = useWatchTokenBalance();

  useEffect(() => {
    if (!pools) {
      return;
    }
    const tokens = pools.map((t) => t.poolConfig.wantSymbol);
    watchToken(tokens);
  }, [watchToken, pools]);

  if (!started) {
    return (
      <StyledContainer>
        <StyledFarmCountdown>
          <img src={ImgCountdown} />
          <h2>Farming will begin in</h2>
          <Countdown to={start} onArrived={() => setStarted(true)} />
        </StyledFarmCountdown>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {account && <FarmHarvestAll />}
      <StyledForm>
        <Collapse>
          {(activeFarms || []).map((p, index) => (
            <FarmItem key={index} index={index} pool={p} />
          ))}
        </Collapse>
        {inActiveFarms?.length ? (
          <StyledInactiveContainer>
            <div className="title">Inactive</div>
            <div className="content">
              <Collapse>
                {(inActiveFarms || []).map((p, index) => (
                  <FarmItem key={index} index={index} pool={p} />
                ))}
              </Collapse>
            </div>
          </StyledInactiveContainer>
        ) : null}
      </StyledForm>
    </StyledContainer>
  );
};

export default Farms;

const StyledFarmCountdown = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
  img {
    width: 100px;
  }
  h2 {
    text-align: center;
    margin: 30px 0 5px 0;
    text-transform: capitalize;
  }
  ${screenUp('lg')`
    padding-top: 100px;
    img {
      width: 164px;
    }
    h2 {
      margin: 30px 0;
    }
  `}
`;

const StyledContainer = styled.div`
  margin-bottom: 25px;
`;

const StyledForm = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 0px;
  border-radius: 20px;
`;

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
