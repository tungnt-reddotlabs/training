import React from 'react';
import styled from 'styled-components';
import { TransactionDetails } from '../../state/transactions/reducer';
import { ExplorerLink } from '../ExplorerLink';
import Spacer from '../Spacer';

interface TransactionProps {
  tx: TransactionDetails;
}

const Transaction: React.FC<TransactionProps> = ({ tx }) => {
  const summary = tx.summary;
  const pending = !tx.receipt;
  const success =
    !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined');

  return summary ? (
    <StyleContainer>
      {pending ? (
        <i className="far fa-circle-notch fa-spin" />
      ) : (
        <i
          className={success ? 'far fa-check-circle' : 'far fa-exclamation-circle'}
          style={{ color: success ? '#0ec871' : '#ff6565' }}
        />
      )}
      <Spacer />
      <ExplorerLink type="tx" address={tx.hash}>
        {summary ?? tx.hash}
      </ExplorerLink>
    </StyleContainer>
  ) : null;
};

const StyleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 2px;
  a {
    font-size: 14px;
    font-weight: normal;
    color: #0e121a;
    :hover {
      text-decoration: underline;
    }
  }
  span {
    font-size: 13px;
    font-weight: normal;
    color: ${({ theme }) => theme.colors.secondary};
    margin: 0px 10px 0px auto;
  }
  :not(:last-child) {
    border-bottom: 1px dashed #acb7d0;
  }
`;

export default Transaction;
