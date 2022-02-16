import { BigNumber } from '@ethersproject/bignumber';

export type Market =
  | 'Firebird'
  | 'SushiSwap'
  | 'QuickSwap'
  | 'Dfyn'
  | 'PolyQuity'
  | 'xDollar'
  | '1Swap'
  | 'SolarBeam';

export type VaulConfig = {
  minichef: string;
  pools: VaulPoolConfig[];
};

export type VaulPoolConfig = {
  id?: number;
  address?: string;
  wantTokens: string[];
  wantSymbol: string;
  rewardToken: string;
  isLp: boolean;
  market: Market;
  minichef?: string;
  vaultUrl?: string;
  coming?: boolean;
  inactive?: boolean;
  startRewardTime?: number;
  rewardPerDay?: number | string;
  name?: string;
};

export type VaulInfo = {
  totalAllocPoint?: BigNumber;
  allocPoint?: BigNumber;
  rewardPerSecond?: BigNumber;
  accRewardPerShare?: BigNumber;
  lastRewardTime?: BigNumber;
  totalStaked?: BigNumber;
  startTime?: number;
};

export type UserVaulInfo = {
  amount?: BigNumber;
  rewardDebt?: BigNumber;
  pendingReward?: BigNumber;
};

export type VaultingPoolInfo = {
  poolInfo?: VaulInfo;
  poolConfig?: VaulPoolConfig;
  userInfo?: UserVaulInfo;
  partnerPoolInfo?: PartnerVaulInfo;
};

export type PartnerVaulInfo = {
  tvl?: string;
  apr?: string;
  apy?: string;
  rewardPerDay?: string;
};
