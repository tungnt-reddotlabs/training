import { Market, Farm } from "./tnh-contract/config";


export const Tokens: { [key: string]: string } = {
  IRON: '0xD86b5923F3AD7b585eD81B448170ae026c65ae9a',
  TITAN: '0xaAa5B9e6c589642f98a1cDA99B9D024B8407285A',
  MATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  ETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
};

export const createAddLiquidityLink = (marketName: Market, token0: string, token1: string) => {
  switch (marketName) {
    case 'QuickSwap':
      return `https://quickswap.exchange/#/add/${Tokens[token0?.toUpperCase()] || ''}/${
        Tokens[token1?.toUpperCase()] || ''
      }`;
    case 'DfynExchange':
    case 'FirebirdFinance':
    case 'IronFinance':
    case 'SushiSwap':
      return `https://app.sushi.com/add/${Tokens[token0?.toUpperCase()] || ''}/${
        Tokens[token1?.toUpperCase()] || ''
      }`;
  }
};

export const createRemoveLiquidityLink = (
  marketName: Market,
  token0: string,
  token1: string,
) => {
  switch (marketName) {
    case 'QuickSwap':
      return `https://quickswap.exchange/#/remove/${Tokens[token0?.toUpperCase()] || ''}/${
        Tokens[token1?.toUpperCase()] || ''
      }`;
    case 'DfynExchange':
    case 'FirebirdFinance':
    case 'IronFinance':
    case 'SushiSwap':
      return `https://app.sushi.com/remove/${Tokens[token0?.toUpperCase()] || ''}/${
        Tokens[token1?.toUpperCase()] || ''
      }`;
  }
};

export const buyTokenLinks: { [key: string]: string } = {
  TITAN:
    'https://quickswap.exchange/#/swap?outputCurrency=0xaAa5B9e6c589642f98a1cDA99B9D024B8407285A',
};

/* ROLE CONFIG PARTNER POOL
  - Set farm url if pool in quickswap, dfyn...
  - Set pool id if partner use Iron Finance pool, not set if the opposite */

export const AllFarms: Farm[] = [
   {
    masterChef: '0xA9e1D08Aa73BA2219E2f6C9F2bB8c33717015768',
    rewardTokenSymbol: 'USDC',
    rewardTokenAddress: '0x4d8e671cC4BE52e08Ab256eD72EB2C5c974c9d56',
    rewardTokenDecimals: 6,
    profitSharing: true,
    inactive: true,
    pools: [
      {
        id: 0,
        token0: 'TNH',
        token1: 'MATIC',
        rewardToken: 'TNH',
        wantSymbol: 'TNH/MATIC LP',
        wantToken: '0x84d7741e0480cb21894f1f6f5672826c6ca365d4',
        isLp: true,
        stable: false,
        profitSharing: true,
        coming: false,
        inactive: false,
        market: 'SushiSwap',
        marketSymbol: 'SUSHISWAP',
      },
      {
        id: 1,
        token0: 'TNH',
        token1: 'USDC',
        rewardToken: 'TNH',
        wantSymbol: 'TNH/USDC LP',
        wantToken: '0x6f8c4061f11dd147fa7e0a8441e674aa583c7308',
        isLp: true,
        stable: false,
        profitSharing: true,
        coming: false,
        inactive: false,
        market: 'QuickSwap',
        marketSymbol: 'QUICKSWAP',
      },
    ],
  },
  

];
