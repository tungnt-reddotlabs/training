import { Configuration } from 'src/tnh-contract/config';
import config from '../../config';

export const useConfiguration = (): Configuration => {
  return config;
};
