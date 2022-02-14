import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import useInterval from '../../../hooks/useInterval';

export type CountDownProps = {
  to: number;
  height?: string;
};

interface RemainingTime {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export const StakingItemCountdown: React.FC<CountDownProps> = ({ to, height }) => {
  const [distance, setDistance] = useState(0);

  const remaining: RemainingTime = useMemo(() => {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return {
      days,
      hours,
      minutes,
      seconds,
    };
  }, [distance]);

  useInterval(
    () => {
      const _distance = to * 1000 - Date.now();
      setDistance(_distance > 0 ? _distance : 0);
    },
    1000,
    to,
  );

  const zeroPadding = (num: number) => {
    return num < 10 ? `0${num}` : num;
  };

  return (
    <StyledContainer height={height}>
      <StyledTime>
        <StyledTimeValue>{zeroPadding(remaining.days)}</StyledTimeValue>
        <StyledTimeLabel>{Number(remaining.days) != 1 ? 'days' : 'day'}</StyledTimeLabel>
      </StyledTime>
      <Separator>:</Separator>
      <StyledTime>
        <StyledTimeValue>{zeroPadding(remaining.hours)}</StyledTimeValue>
        <StyledTimeLabel>{Number(remaining.hours) != 1 ? 'hours' : 'hour'}</StyledTimeLabel>
      </StyledTime>
      <Separator>:</Separator>
      <StyledTime>
        <StyledTimeValue>{zeroPadding(remaining.minutes)}</StyledTimeValue>
        <StyledTimeLabel>
          {Number(remaining.minutes) != 1 ? 'minutes' : 'minute'}
        </StyledTimeLabel>
      </StyledTime>
      <Separator>:</Separator>
      <StyledTime>
        <StyledTimeValue>{zeroPadding(remaining.seconds)}</StyledTimeValue>
        <StyledTimeLabel>
          {Number(remaining.seconds) != 1 ? 'seconds' : 'second'}
        </StyledTimeLabel>
      </StyledTime>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ height?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const StyledTime = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const StyledTimeValue = styled.div`
  width: 60px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  color: ${(props) => props.theme.colors.primary};
`;

const StyledTimeLabel = styled.div`
  padding-top: 2px;
  font-size: 10px;
  font-weight: normal;
  color: #555a71;
`;

const Separator = styled.div`
  font-size: 14px;
  font-weight: normal;
  color: #555a71;
`;
