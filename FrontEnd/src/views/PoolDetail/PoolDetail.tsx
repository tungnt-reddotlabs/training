import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { ExplorerLink } from '../../components/ExplorerLink';
import { TokenSymbol } from '../../components/TokenSymbol';
import { getPoolConfig } from '../../config';
import { leavePool } from '../../state/stablepool/actions';
import { useEnterPool } from '../../state/stablepool/hooks';
import { shortenAddress } from '../../utils/addresses';
import { screenUp } from '../../utils/styles';
import Deposit from '../Deposit';
import Withdraw from '../Withdraw';
import { PoolInfo } from './components/PoolInfo';

const PoolDetail: React.FC = () => {
  const { url, path } = useRouteMatch();
  const { chainId } = useWeb3React();
  const { id: poolId } = useParams<{ id: string }>();
  const pool = getPoolConfig(chainId, poolId);
  const dispatch = useDispatch();
  const enterPool = useEnterPool();
  const shortenPoolAddress = shortenAddress(pool?.address || '');

  useEffect(() => {
    enterPool(poolId);
    return () => {
      dispatch(leavePool());
    };
  }, [dispatch, enterPool, poolId]);

  return (
    <StyleContainer>
      <StyledBreadcrumb>
        <StyleNavLink to={`/pools`}>
          <i className="far fa-long-arrow-left"></i>
          Back to pools
        </StyleNavLink>
      </StyledBreadcrumb>
      <StyledHeader>
        <div className="left">
          <TokenSymbol
            symbol={pool?.lpToken === '1S3P' ? `${pool?.lpToken}_LP` : pool?.lpToken}
          />
          <div className="content">
            <span>{pool?.name}</span>
            <ExplorerLink type="address" address={pool?.address}>
              {shortenPoolAddress}
              <i className="fal fa-external-link-alt"></i>
            </ExplorerLink>
          </div>
        </div>
        <div className="right">
          <StyledButtonSwap to="/">
            <i className="far fa-exchange"></i>
            <span className="swap-text">Swap</span>
          </StyledButtonSwap>
        </div>
      </StyledHeader>
      <StyledContentContainer>
        <PoolInfo />
        <StyledForm>
          <StyledFormHeader>
            <SwitchItem to={`${url}/deposit`} exact>
              Deposit
            </SwitchItem>
            <SwitchItem to={`${url}/withdraw`}>Withdraw</SwitchItem>
          </StyledFormHeader>
          <Switch>
            <Route path={`${path}/deposit`} exact>
              <Deposit />
            </Route>
            <Route path={`${path}/withdraw`}>
              <Withdraw />
            </Route>
          </Switch>
        </StyledForm>
      </StyledContentContainer>
    </StyleContainer>
  );
};

const StyledForm = styled.div``;

const StyledFormHeader = styled.div`
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SwitchItem = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 50px;
  font-size: 16px;
  color: #ffffff;
  border-style: solid;
  font-weight: bold;
  border-color: #dce0e2;
  border-width: 1px;
  background: #dce0e2;
  color: #555a71;
  &.active,
  &.matched {
    background: #ffffff;
    color: #3085b1;
    border-color: #ffffff;
  }
  &:not(.active):hover {
    color: #3085b1;
  }
`;

const StyleContainer = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const StyledBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  i {
    margin: 0px 4px;
    font-size: 10px;
    color: #adafb4;
  }
`;

const StyleNavLink = styled(NavLink)`
  font-size: 14px;
  font-weight: normal;
  color: #fff;
  i {
    font-size: 16px;
  }
  :hover {
    color: #3085b1;
    i {
      color: #3085b1;
    }
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0px;
  .right {
    padding-left: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .left {
    flex: 1;
    display: flex;
    align-items: center;
    overflow: hidden;
    img {
      width: 100px;
      height: 50px;
      object-fit: contain;
    }
  }
  .content {
    margin-left: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    span {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    a {
      display: flex;
      align-items: center;
      margin-top: 4px;
      font-size: 13px;
      font-weight: normal;
      color: #d2d2d2;
      i {
        margin-left: 4px;
        margin-bottom: 3px;
        font-size: 11px;
      }
      &:hover {
        color: #75b4d3;
      }
    }
  }
  ${screenUp('lg')`
    padding: 20px 0px 32px 0px;
    .content {
      font-size: 18px;
    }
    .right {
      margin-top: 0px;
      margin-left: auto;
      .swap-text {
        display: inline;
      }
    }
  `}
`;

export const StyledButtonSwap = styled(NavLink)`
  padding: 8px 12px;
  border: 1px solid #3085b1;
  width: fit-content;
  font-size: 14px;
  font-weight: bold;
  background-color: #3085b1;
  color: #fff;
  i {
    margin-right: 6px;
  }
  ${screenUp('lg')`
    font-size: 16px;
    padding: 10px 18px;
  `}
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  margin-top: 10px;
  ${screenUp('lg')`
    display: grid;
    grid-gap: 20px;
    grid-template-columns: 2fr 3fr;
    align-items: flex-start;
    margin-top: 0px;
  `}
`;

export default PoolDetail;
