import { ChainConfig } from './type';

const config: ChainConfig = {
  providerUrl: 'https://polygon-rpc.com',
  explorerUrl: 'https://polygonscan.com',
  backendUrl: '',
  multicall: '0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507',
  // swapRouter: '0x3A9364357E4Acfe0Bc930B87377fCbE02DD6cb19',
  nativeToken: 'MATIC',
  defaultSwapToken: {
    fromTokenSymbol: 'USDC',
    toTokenSymbol: 'USDT',
  },
  partnerStableCoinSymbols: [],
  chainStableCoinSymbols: [],
  pools: {},
  farms: [
    {
      minichef: '0xA9e1D08Aa73BA2219E2f6C9F2bB8c33717015768',
      pools: [
        {
          id: 0,
          wantTokens: ['TNH', 'MATIC'],
          wantSymbol: 'TNH-MATIC',
          rewardToken: 'TNH',
          isLp: true,
          market: 'SushiSwap',
          rewardPerDay: '100000',
          minichef: '0xA9e1D08Aa73BA2219E2f6C9F2bB8c33717015768',
        },
        {
          id: 1,
          wantTokens: ['TNH', 'USDC'],
          wantSymbol: 'TNH-USDC',
          rewardToken: 'TNH',
          isLp: true,
          market: 'QuickSwap',
          rewardPerDay: '100000',
          minichef: '0xA9e1D08Aa73BA2219E2f6C9F2bB8c33717015768'
        },
      ],
    },
  ],
  partnerFarms: [],
  stakingVaults: [
    {
      address: '0xcb3db27e50df422d809e8231b1844a69af992bfe',
      wantTokens: ['TNH', 'MATIC'],
      rewardToken: 'TNH',
      wantSymbol: 'TNH-MATIC',
      rewardSymbol: 'TNH',
      inActive: true,
    },
    {
      address: '0x598253d17a5f5d6789c9dc542f852abe154071e7',
      wantTokens: ['TNH', 'USDC'],
      rewardToken: 'TNH',
      wantSymbol: 'TNH-USDC',
      rewardSymbol: 'TNH',
      inActive: true,
    }
  ],
  tokens: {
    USDC: {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
    },
    MATIC: {
      address: 'ETH',
      decimals: 18,
    },
    TNH: {
      address: '0x4d8e671cC4BE52e08Ab256eD72EB2C5c974c9d56',
      decimals: 18,
    },
    'TNH-USDC': {
      address: '0x6f8c4061f11dd147fa7e0a8441e674aa583c7308',
      decimals: 18,
      name: 'TNH-USDC LP',
    },
    'TNH-MATIC': {
      address: '0x84d7741e0480cb21894f1f6f5672826c6ca365d4',
      decimals: 18,
      name: 'TNH-MATIC LP',
    },
  },
};

export default config;
