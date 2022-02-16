import React, { useState } from 'react';
import styled from 'styled-components';
import { useVaultingPools } from '../../state/vaults/hooks';
import VaultItem from './components/VaultItemNew';
import { useEffect } from 'react';
import { useWatchTokenBalance } from '../../state/user/hooks';
import { useMemo } from 'react';
import { Collapse } from '../../components/Collapse';

const Vaults: React.FC = () => {
  const pools = useVaultingPools();

  const corePools = useMemo(() => {
    return pools?.filter((p) => !p?.poolConfig?.vaultUrl);
  }, [pools]);

  const activeVaults = useMemo(() => {
    return corePools?.filter((s) => !s.poolConfig.inactive);
  }, [corePools]);

  const watchToken = useWatchTokenBalance();

  useEffect(() => {
    if (!pools) {
      return;
    }
    const tokens = pools.map((t) => t.poolConfig.wantSymbol);
    watchToken(tokens);
  }, [watchToken, pools]);

  return (
    <StyledContainer>
      <StyledForm>
        <Collapse>
          {(activeVaults || []).map((p, index) => (
            <VaultItem key={index} index={index} pool={p} />
          ))}
        </Collapse>
      </StyledForm>
    </StyledContainer>
  );
};

export default Vaults;


const StyledContainer = styled.div`
  margin-bottom: 25px;
`;

const StyledForm = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 0px;
  border-radius: 20px;
`;

