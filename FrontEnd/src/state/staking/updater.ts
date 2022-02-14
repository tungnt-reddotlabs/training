import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetAllStakingVaultConfig } from '../../hooks/useGetAllStakingVaultConfig';
import { initialLoadAllStakingVaultsSuccess } from './actions';

const Updater: React.FC = () => {
  const dispatch = useDispatch();
  const stakingVaults = useGetAllStakingVaultConfig();

  useEffect(() => {
    dispatch(initialLoadAllStakingVaultsSuccess(stakingVaults));
  }, [dispatch, stakingVaults]);
  return null;
};

export default Updater;
