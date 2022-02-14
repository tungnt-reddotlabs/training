import React from 'react';
import styled from 'styled-components';
import { useTokenPrice } from '../../../../state/tokens/hooks';
import { BigNumberValue } from '../../../BigNumberValue';
import logoReward from '../../../../assets/images/logo.png';
import { screenUp } from '../../../../utils/styles';
import Modal1Swap from '../../../Modal1Swap';
import useModal from '../../../../hooks/useModal';

const ButtonIce: React.FC = () => {
  const rewardPrice = useTokenPrice('1SWAP');
  const [show1SwapModal] = useModal(<Modal1Swap />);

  return (
    <StyledContainer onClick={show1SwapModal}>
      <div className="logo">
        <img src={logoReward} />
      </div>
      <span>
        <BigNumberValue value={rewardPrice} decimals={18} fractionDigits={4} currency="USD" />
      </span>
    </StyledContainer>
  );
};

const StyledContainer = styled.button`
  margin-right: 10px;
  display: none;
  align-items: center;
  height: 40px !important;
  border: 1px solid ${({ theme }) => theme.colors.header.border};
  cursor: default;
  padding: 0px;
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 38px;
    background-color: ${({ theme }) => theme.colors.header.price};
    img {
      height: 30px;
    }
  }
  ${screenUp('lg')`
    display: flex;
    margin-right: 10px;
    span {
      padding: 0px 10px;
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
    }
  `}
  &:hover {
    background-color: ${({ theme }) => theme.colors.header.avatarHover};
  }
`;

export default ButtonIce;
