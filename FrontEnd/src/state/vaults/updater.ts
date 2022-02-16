import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAllVaultsConfig } from '../../config';
import { initialLoadVaultingPoolsSuccess } from './actions';

const Updater: React.FC = () => {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch();

  useEffect(() => {
    const pools = getAllVaultsConfig(chainId) || [];
    console.log(pools);
    console.log('aaaaaaaaaaaaaaaa');
    dispatch(initialLoadVaultingPoolsSuccess(pools));
  }, [chainId, dispatch]);
  return null;
};

export default Updater;
