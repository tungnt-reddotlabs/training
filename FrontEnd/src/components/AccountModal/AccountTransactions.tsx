import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  isTransactionRecent,
  useAllTransactions,
  useClearAllTransactions,
} from '../../state/transactions/hooks';
import { TransactionDetails } from '../../state/transactions/reducer';
import { ModalContent } from '../Modal/ModalStyles';
import Transaction from './Transaction';
const MAX_TRANSACTION_HISTORY = 10;

const AccountTransactions: React.FC = () => {
  const allTransactions = useAllTransactions();
  const clearAllTransactions = useClearAllTransactions();

  const newTransactionsFirst = useCallback((a: TransactionDetails, b: TransactionDetails) => {
    return b.addedTime - a.addedTime;
  }, []);

  const { account } = useWeb3React();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions).filter((t) => t.from === account);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [account, allTransactions, newTransactionsFirst]);

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt);
  const confirmed = sortedRecentTransactions
    .filter((tx) => tx.receipt)
    .slice(0, MAX_TRANSACTION_HISTORY);

  const isEmpty = confirmed?.length + pending?.length == 0;
  return (
    <StyledTransactions>
      {isEmpty && (
        <StyledNoTransaction>Your transactions will appear here...</StyledNoTransaction>
      )}
      {!isEmpty && (
        <StyledTransactionsHeader>
          History
          <button onClick={clearAllTransactions}>
            <i className="far fa-trash-alt" />
            Clear
          </button>
        </StyledTransactionsHeader>
      )}
      {!isEmpty && (
        <StyledModalContent>
          <StyledTransactionList>
            {pending?.length > 0 && pending.map((tx) => <Transaction key={tx.hash} tx={tx} />)}
            {confirmed?.length > 0 &&
              confirmed.map((tx) => <Transaction key={tx.hash} tx={tx} />)}
          </StyledTransactionList>
        </StyledModalContent>
      )}
    </StyledTransactions>
  );
};

const StyledTransactions = styled.div``;

const StyledNoTransaction = styled.div`
  margin: 0px 24px 20px 24px;
  font-size: 14px;
  font-weight: normal;
  color: #070a10;
`;

const StyledTransactionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px 24px 12px 24px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #070a10;
  button {
    color: #555a71;
    font-size: 13px;
    display: flex;
    align-items: center;
    i {
      margin-bottom: 2px;
    }
    &:hover {
      color: #3085b1;
    }
  }
  i {
    margin-right: 3px;
  }
`;

const StyledTransactionList = styled.div``;

const StyledModalContent = styled(ModalContent)`
  padding: 8px 14px;
`;

export default AccountTransactions;
