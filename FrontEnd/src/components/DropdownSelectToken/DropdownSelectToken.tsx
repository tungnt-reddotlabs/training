import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { DropdownMenu } from '../Dropdown';
import { useTokenBalances } from '../../state/user/hooks';
import { BigNumberValue } from '../BigNumberValue';
import { getTokenConfig } from '../../config';
import { useWeb3React } from '@web3-react/core';
import { TokenSymbol } from '../TokenSymbol';
import { Dropdown } from '../Dropdown/Dropdown';
import { DropdownToggle } from '../Dropdown/DropdownToggle';
import { ReactElement } from 'react';
import { useIgnoreSelectTokens } from '../../state/stableswap/hooks';

export type DropdownSelectTokenProps = {
  tokens?: string[];
  onSelect?: (token: string) => void;
  position?: 'right' | 'left';
  direction?: 'up' | 'down';
  children: ReactElement;
  type?: 'fromToken' | 'toToken' | 'normal';
};

export const DropdownSelectToken: React.FC<DropdownSelectTokenProps> = ({
  tokens,
  onSelect,
  position = 'left',
  children,
  type = 'normal',
}) => {
  const { chainId } = useWeb3React();
  const balances = useTokenBalances(tokens);
  const ignoreSelectTokens = useIgnoreSelectTokens();

  const ignoreTokens = useMemo(() => {
    switch (type) {
      case 'fromToken':
        return ignoreSelectTokens.from;
      case 'toToken':
        return ignoreSelectTokens.to;

      default:
        return [];
    }
  }, [ignoreSelectTokens, type]);

  const tokenConfigs = useMemo(() => {
    if (!chainId || !tokens) return [];
    return tokens.map((t) => {
      const tokenConfig = getTokenConfig(chainId, t);
      return {
        symbol: t,
        address: tokenConfig?.address,
        decimals: tokenConfig?.decimals,
      };
    });
  }, [chainId, tokens]);

  const onSelectToken = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      const symbol = ev.currentTarget.dataset.symbol;
      if (symbol && onSelect && !ignoreTokens.includes(symbol)) {
        onSelect(symbol);
      }
    },
    [ignoreTokens, onSelect],
  );

  return (
    <Dropdown>
      <DropdownToggle>{children}</DropdownToggle>
      <StyledDropdownMenu position={position}>
        <StyleDropdownList>
          {tokenConfigs?.map((token, index) =>
            !ignoreTokens.includes(token.symbol) ? (
              <StyleDropdownItem data-symbol={token.symbol} key={index} onClick={onSelectToken}>
                <TokenSymbol symbol={token.symbol} size={36} />
                <div className="info">
                  {token?.symbol}
                  <div className="balance">
                    <BigNumberValue
                      value={balances[token?.symbol]}
                      decimals={token?.decimals}
                      fractionDigits={4}
                      keepCommas
                    />
                  </div>
                </div>
                {/* <button data-symbol={token.symbol} className="btn-add" onClick={onAddToken}>
                  <i className="far fa-plus-circle" />
                </button> */}
              </StyleDropdownItem>
            ) : null,
          )}
        </StyleDropdownList>
      </StyledDropdownMenu>
    </Dropdown>
  );
};

const StyledDropdownMenu = styled(DropdownMenu)`
  border-radius: none;
  height: 275px;
  overflow-x: auto;
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #fafafa;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #c1c1c1;
  }
`;

const StyleDropdownList = styled.div`
  margin-top: -8px;
  margin-left: -8px;
  margin-right: -8px;
`;

const StyleDropdownItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding: 10px 15px;
  color: #070a10;
  .info {
    margin-left: 12px;
    margin-right: 100px;
    text-align: left;
    font-size: 16px;
    font-weight: normal;
    .balance {
      font-size: 12px;
      font-weight: normal;
      color: #555a71;
    }
  }
  .btn-add {
    margin-left: auto;
    color: #555a71;
    transition: all 0.1s ease-in-out 0s;
    i {
      font-size: 14px;
    }
    :hover {
      color: #ffffff;
    }
  }
  :hover {
    background-color: #d0d9eb;
  }
`;
