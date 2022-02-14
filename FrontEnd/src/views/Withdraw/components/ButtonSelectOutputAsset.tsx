import React from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Dropdown, DropdownMenu, DropdownToggle } from '../../../components/Dropdown';
import { useCurrentPoolAssets } from '../../../state/stablepool/hooks';
import { screenUp } from '../../../utils/styles';

export type ButtonSelectOutputAssetAssetProps = {
  selected: number;
  onSelect: (id: number) => void;
  onUseSingleOutput: (singleOutput: boolean) => void;
  useBasePoolToken?: boolean;
};

export const ButtonSelectOutputAsset: React.FC<ButtonSelectOutputAssetAssetProps> = ({
  selected,
  onSelect,
  onUseSingleOutput,
  useBasePoolToken,
}) => {
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const allToken = 'All tokens';

  const tokens = useMemo(() => {
    return assets.map((t) => t.symbol);
  }, [assets]);

  const symbol = useMemo(() => {
    return selected !== -1 ? tokens[selected] : allToken;
  }, [selected, tokens]);

  const onSelectToken = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      const value = ev.currentTarget.dataset.symbol;
      if (value === allToken) {
        onUseSingleOutput(false);
        return;
      }
      onUseSingleOutput(true);
      onSelect(tokens.indexOf(value));
    },
    [onSelect, onUseSingleOutput, tokens],
  );

  return (
    <Dropdown>
      <DropdownToggle>
        <StyledToken>
          {symbol}
          <i className="far fa-angle-down" />
        </StyledToken>
      </DropdownToggle>
      <DropdownMenu position="right">
        <StyledDropdownHeader>Token</StyledDropdownHeader>
        <StyleDropdownList>
          {[allToken]?.concat(tokens)?.map((token, index) => (
            <StyleDropdownItem
              active={token === symbol}
              data-symbol={token}
              key={index}
              onClick={onSelectToken}
            >
              {token}
            </StyleDropdownItem>
          ))}
        </StyleDropdownList>
      </DropdownMenu>
    </Dropdown>
  );
};

const StyledToken = styled.span`
  cursor: pointer;
  font-size: 13px;
  font-weight: normal;
  color: #3085b1;
  i {
    margin-left: 4px;
  }
  :hover {
    color: #070a10;
    i {
      color: #070a10;
    }
  }
  ${screenUp('lg')`
    font-size: 14px;
    i {
      margin-left: 6px;
    }
  `}
`;

const StyledDropdownHeader = styled.div`
  margin-bottom: 10px;
  padding-bottom: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #070a10;
  border-bottom: 1px dashed #acb7d0;
`;

const StyleDropdownList = styled.div`
  margin-top: 10px;
  margin-left: -8px;
  margin-right: -8px;
`;

const StyleDropdownItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: normal;
  color: ${({ active }) => (active ? '#3085b1' : '#070a10')};
  :hover {
    background-color: #fdf9f9;
  }
`;
