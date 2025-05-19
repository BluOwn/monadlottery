// Monad Testnet Configuration
export const MONAD_TESTNET_CHAIN_ID = '10143';

export const MONAD_TESTNET_CONFIG = {
  id: parseInt(MONAD_TESTNET_CHAIN_ID),
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    public: { http: ['https://testnet-rpc.monad.xyz/'] },
    default: { http: ['https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com/' },
  },
};

// Contract Address
export const MONAD_LOTTERY_CONTRACT_ADDRESS = '0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2';

// Social Links
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/BluOwn/monad-lottery',
  TWITTER: 'https://twitter.com/Oprimedev',
  CONTRACT_EXPLORER: `https://testnet.monadexplorer.com/address/${MONAD_LOTTERY_CONTRACT_ADDRESS}`,
  WEBSITE: 'https://lottery.monadescrow.xyz',
};

// Lottery Configuration
export const LOTTERY_CONFIG = {
  TICKET_PRICE: '0.01', // Default ticket price in MON
  PRIZE_DISTRIBUTION: {
    FIRST_PLACE: 0.4, // 40%
    SECOND_PLACE: 0.2, // 20%
    THIRD_PLACE: 0.1, // 10%
    TOP_BUYER: 0.1, // 10%
    ADMINISTRATION: 0.2, // 20%
  },
};