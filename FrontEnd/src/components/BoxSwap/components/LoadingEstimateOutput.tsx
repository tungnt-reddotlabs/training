import intervalToDuration from 'date-fns/intervalToDuration';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import useInterval from '../../../hooks/useInterval';
import { useIsAutoRefresh, useToggleAutoRefresh } from '../../../state/stableswap/hooks';
import { PriceUpdateInterval } from '../../../utils/constants';

const LoadingEstimateOutput: React.FC<{
  lastRefresh: number;
  radius?: number;
  stroke?: number;
}> = ({ lastRefresh, radius = 11, stroke = 2 }) => {
  const isAutoRefresh = useIsAutoRefresh();
  const toggleAutoRefresh = useToggleAutoRefresh();
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const refreshTime = PriceUpdateInterval * 1000;
  const [waitingRefreshSeconds, setWaitingRefreshSeconds] = useState(0);

  const updateSeconds = useCallback(() => {
    const current = Date.now();
    if (current > lastRefresh + refreshTime) {
      setWaitingRefreshSeconds(0);
    } else {
      const duration = intervalToDuration({
        start: current,
        end: lastRefresh + refreshTime,
      });
      setWaitingRefreshSeconds(duration.seconds);
    }
  }, [lastRefresh, refreshTime]);

  useInterval(updateSeconds, 1000);

  const progress = useMemo(() => {
    const value = (waitingRefreshSeconds / PriceUpdateInterval) * 100;
    return value > 0 ? value : 100;
  }, [waitingRefreshSeconds]);

  const strokeDashoffset = useMemo(() => {
    return circumference - (progress / 100) * circumference;
  }, [circumference, progress]);

  const ontoggleAutoRefresh = useCallback(() => {
    toggleAutoRefresh();
    setWaitingRefreshSeconds(0);
  }, [toggleAutoRefresh]);

  return (
    <StyledButton onClick={ontoggleAutoRefresh}>
      {isAutoRefresh ? (
        <StyledContainer height={radius * 2} width={radius * 2} preserveAspectRatio="none">
          <circle
            stroke="#ffffff"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </StyledContainer>
      ) : (
        <i className="far fa-history" />
      )}
    </StyledButton>
  );
};

const StyledButton = styled.button`
  padding: 0px;
  color: #ffffff;
  font-size: 20px;
  svg {
    vertical-align: middle;
  }

  :hover {
    color: #ffb03c;
  }
`;

const StyledContainer = styled.svg`
  background-color: rgba(255, 255, 255, 0.26);
  border-radius: 100%;
  circle {
    transition: all 1s;
  }
`;

export default LoadingEstimateOutput;
