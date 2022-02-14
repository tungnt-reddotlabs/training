import styled from 'styled-components';
import { ModalHeader } from '../../../components/Modal/ModalStyles';

const Colors = {
  success: '#3085b1',
  secondary: '#070a10',
  danger: '#fb6161',
  normal: '#070a10',
  warn: '#ffb03c',
};

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  grid-gap: 15px 10px;
`;

export const Label = styled.div`
  grid-column: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: normal;
  color: #555a71;
  strong {
    margin-left: 8px;
  }
`;

export const Value = styled.div<{
  variant?: 'normal' | 'secondary' | 'success' | 'danger' | 'warn';
}>`
  grid-column: 2;
  justify-self: flex-end;
  font-size: 14px;
  font-weight: normal;
  color: ${(p) => (p.variant ? Colors[p.variant] : '#070a10')};
`;

export const ValueSecondary = styled(Value)`
  font-size: 16px;
  font-weight: normal;
  color: #070a10;
`;

export const ModalRow = styled.div`
  font-size: 15px;
  display: flex;
  align-items: center;
  :not(:last-child) {
    padding-bottom: 16px;
  }
  img {
    height: 34px;
    object-fit: contain;
    margin-left: 8px;
  }
`;

export const ModalRowTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #555a71;
`;

export const ModalRowValue = styled.div<{
  variant?: 'normal' | 'secondary' | 'success' | 'danger' | 'warn';
}>`
  margin-left: auto;
  font-size: 15px;
  font-weight: ${({ variant }) => (variant === 'success' ? 'bold' : 'normal')};
  color: ${(p) => (p.variant ? Colors[p.variant] : '#070a10')};
`;

export const Separator = styled.div`
  margin: 20px 0px;
  border-bottom: 1px dashed #acb7d0;
`;

export const StyledTotal = styled.div`
  font-size: 16px;
  font-weight: normal;
  line-height: 1.5;
  color: #ffffff;
`;

export const StyledBox = styled.div`
  padding: 20px 24px;
  background-color: #ffffff;
`;

export const StyledBoxHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #070a10;
  span {
    margin-right: auto;
  }
`;

export const StyledBoxContent = styled.div`
  margin-top: 20px;
`;

export const ModalSwapHeader = styled(ModalHeader)``;
