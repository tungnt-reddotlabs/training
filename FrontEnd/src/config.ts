import { Configuration } from './chain/config';
import deploymentMainnet from './chain/abi/mainnet';

const config: Configuration = {
  chainId: 137,
  etherscanUrl: 'https://polygonscan.com',
  defaultProvider: 'https://rpc-mainnet.maticvigil.com',
  deployments: deploymentMainnet,
  tokens: {
    USDC: ['0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6],
  },
  pollingInterval: 10 * 1000,
  refreshInterval: 10 * 1000,
  gasLimitMultiplier: 1.5,
  excludedAddress: [],
  multicall: '0x2C738AABBd2FA2e7A789433965BEEb7429cB4D7e',
};

export default config;
