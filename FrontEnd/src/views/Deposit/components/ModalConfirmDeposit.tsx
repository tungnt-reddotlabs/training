import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';
import { useCallback } from 'react';
import { BigNumberValue } from '../../../components/BigNumberValue';
import Modal from '../../../components/Modal';
import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalProps,
  ModalTitle,
} from '../../../components/Modal/ModalStyles';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { useGetSlippagePrecise } from '../../../state/application/hooks';
import { useCurrentPool, useCurrentPoolAssets } from '../../../state/stablepool/hooks';
import { DepositEstimation } from '../hooks/useEstimatedOutput';
import { ButtonDeposit } from './ButtonDeposit';
import {
  TwoColumnGrid,
  Label,
  Value,
  Separator,
  ValueSecondary,
  ModalSwapHeader,
  ModalRow,
  ModalRowTitle,
  ModalRowValue,
} from '../../PoolDetail/components/Share';
import { parseUnits } from '@ethersproject/units';
import { useUserToken } from '../../../state/user/hooks';
import { BonusPrecision, ImpactPrecision } from '../../../utils/constants';
export type ModalConfirmDepositProps = ModalProps & {
  estimation: DepositEstimation;
  input: BigNumber[];
  onConfirm: () => void;
  useBasePoolToken?: boolean;
};

export const ModalConfirmDeposit: React.FC<ModalConfirmDepositProps> = ({
  input,
  estimation,
  onDismiss,
  onConfirm,
  useBasePoolToken,
}) => {
  const assets = useCurrentPoolAssets(useBasePoolToken);
  const pool = useCurrentPool();
  const slippage = useGetSlippagePrecise();
  const impactThreshold = parseUnits('2', 8);
  const lpToken = useUserToken(pool.lpToken);

  const onSubmit = useCallback(() => {
    onConfirm();
    onDismiss();
  }, [onConfirm, onDismiss]);

  return (
    <Modal size="sm">
      <ModalSwapHeader>
        <ModalCloseButton onClick={onDismiss} />
        <ModalTitle>Confirm deposit</ModalTitle>
      </ModalSwapHeader>
      <ModalContent>
        <div>
          {assets.map((t, index) => (
            <ModalRow key={index}>
              {index === 0 ? <ModalRowTitle>Deposit</ModalRowTitle> : null}
              <ModalRowValue>
                <BigNumberValue value={input[index]} decimals={t.decimals} />
              </ModalRowValue>
              &nbsp;
              {t?.symbol}
              <TokenSymbol symbol={t?.symbol} size={24} />
            </ModalRow>
          ))}
        </div>
        <Separator />
        <div>
          <ModalRow>
            <ModalRowTitle>Receive</ModalRowTitle>
            <ModalRowValue variant="success">
              <BigNumberValue value={estimation.lpAmount} decimals={lpToken.decimals} />
            </ModalRowValue>
            &nbsp;
            {pool?.lpToken}
            <TokenSymbol symbol={pool.lpToken} />
          </ModalRow>
        </div>
        <Separator />
        <TwoColumnGrid>
          <Label>Share of pool</Label>
          <ValueSecondary>
            <BigNumberValue
              value={estimation.poolShare}
              decimals={6}
              percentage
              fractionDigits={2}
            />
          </ValueSecondary>
          <>
            <Label> {estimation?.impact ? 'Price impact' : 'Bonus'}</Label>
            {estimation?.impact ? (
              <Value variant={estimation?.impact.gt(impactThreshold) ? 'danger' : 'normal'}>
                {estimation?.impact && estimation?.impact?.gte(ImpactPrecision) ? '-' : ''}
                <BigNumberValue
                  value={estimation?.impact}
                  decimals={10}
                  percentage
                  fractionDigits={4}
                />
              </Value>
            ) : (
              <Value variant="success">
                {estimation?.bonus && estimation?.bonus?.gte(BonusPrecision) ? '+' : ''}
                <BigNumberValue
                  value={estimation?.bonus}
                  decimals={10}
                  percentage
                  fractionDigits={4}
                />
              </Value>
            )}
          </>
          <Label>Slippage</Label>
          <ValueSecondary>
            <BigNumberValue value={slippage} decimals={10} percentage fractionDigits={2} />
          </ValueSecondary>
        </TwoColumnGrid>
      </ModalContent>
      <ModalFooter>
        <ButtonDeposit
          minOutput={estimation?.lpAmount}
          amounts={input}
          onSubmit={onSubmit}
          useBasePoolToken={useBasePoolToken}
        />
      </ModalFooter>
    </Modal>
  );
};
