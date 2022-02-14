import ApplicationUpdater from './application/updater';
import TransactionUpdater from './transactions/updater';
import UserUpdater from './user/updater';
import TokensUpdater from './tokens/updater';
import StablePoolUpdater from './stablepool/updater';
import StableSwapUpdater from './stableswap/updater';
import FarmUpdater from './farms/updater';
import { FarmInfoUpdater } from './farms/updaterFarmInfo';
import FarmUserUpdater from './farms/updaterUserFarmInfo';
import StakingUpdater from './staking/updater';
import StakingInfoUpdater from './staking/updaterStakingInfo';
import StakingUserUpdater from './staking/updaterUserStakingInfo';

export const Updaters: React.FC = () => {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <UserUpdater />
      <TokensUpdater />
      <StablePoolUpdater />
      <StableSwapUpdater />
      <FarmUpdater />
      <FarmInfoUpdater />
      <FarmUserUpdater />
      <StakingUpdater />
      <StakingInfoUpdater />
      <StakingUserUpdater />
    </>
  );
};
