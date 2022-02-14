import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../components/BigNumberValue';
import { TokenInputWithApprove } from '../../components/TokenInput/TokenInputWithApprove';
import { useCurrentPool } from '../../state/stablepool/hooks';
import { useUserToken } from '../../state/user/hooks';
import { screenUp } from '../../utils/styles';
import { BoxEstimateWithdraw } from './components/BoxEstimateWithdraw';

const Withdraw: React.FC = () => {
  const pool = useCurrentPool();
  const lpToken = useUserToken(pool?.lpToken);
  const [amount, setAmount] = useState<BigNumber>();
  const [spender, setSpender] = useState(pool?.address);
  const [useBasePoolToken, setUseBasePoolToken] = useState(false);

  const resetInput = useCallback(() => {
    setAmount(null);
  }, []);

  const onClickBalance = useCallback(() => {
    setAmount(lpToken?.balance);
  }, [lpToken?.balance]);

  return (
    <StyledContainer>
      <StyledTokenInput>
        <StyledInputHeader>
          Input {lpToken?.symbol}
          <span>
            Balance:{' '}
            <button
              onClick={onClickBalance}
              disabled={!lpToken?.balance || lpToken?.balance?.eq(Zero)}
            >
              <BigNumberValue
                fractionDigits={2}
                decimals={lpToken?.decimals}
                value={lpToken?.balance}
              />
            </button>
          </span>
        </StyledInputHeader>
        <TokenInputWithApprove
          value={amount}
          onChange={setAmount}
          decimals={lpToken?.decimals}
          symbol={lpToken?.symbol}
          maxValue={lpToken?.balance}
          spender={spender}
        />
      </StyledTokenInput>
      <StyledArrow>
        <div className="circle">
          <i className="far fa-chevron-double-down"></i>
        </div>
        <div className="line" />
      </StyledArrow>
      <BoxEstimateWithdraw
        requireApproval={setSpender}
        onConfirmed={resetInput}
        input={amount}
        useBasePoolToken={useBasePoolToken}
        onToggle={pool?.basePool ? setUseBasePoolToken : undefined}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 10px 26px 38px 26px;
  background-color: #ffffff;
  margin-bottom: 20px;
  ${screenUp('lg')`
    margin-bottom: 0px;
  `}
`;

const StyledTokenInput = styled.div`
  margin: 15px 0px;
`;

const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  color: #070a10;
  padding-bottom: 10px;
  span {
    font-size: 14px;
    font-weight: normal;
    color: #555a71;
    button {
      color: #3085b1;
      padding: 0;
      :hover {
        color: #070a10;
      }
    }
  }
`;

const StyledArrow = styled.div`
  margin: 0px 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 97%;
  margin-left: auto;
  .circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 33px;
    height: 33px;
    border: 1px solid #acb7d0;
    border-radius: 100px;
    i {
      color: #3085b1;
    }
  }
  .line {
    flex: 1;
    margin-left: 10px;
    border-bottom: 1px dashed #acb7d0;
  }
`;

export default Withdraw;
