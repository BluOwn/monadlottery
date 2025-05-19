# Monad Lottery

A decentralized lottery application built on the Monad blockchain testnet.

## Website

[lottery.monadescrow.xyz](https://lottery.monadescrow.xyz)

## Description

Monad Lottery is an unofficial lottery giveaway on the Monad testnet. Users can purchase lottery tickets using Monad testnet tokens (MON), with each ticket costing 0.01 MON. The more tickets purchased, the higher the chances of winning. Winners are selected using Google's random number generator.

## Features

- Connect your wallet to the Monad testnet
- Purchase lottery tickets with testnet MON tokens
- View your purchased tickets and lottery statistics
- Prize distribution:
  - First Place: 40% of total pool
  - Second Place: 20% of total pool
  - Third Place: 10% of total pool
  - Top Buyer: 10% of total pool
  - Administration: 20% of total pool

## Smart Contract

The lottery is powered by a smart contract deployed on the Monad testnet. The contract handles ticket purchases, tracking ownership, and prize distribution.

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Metamask or another Web3 wallet

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/monad-lottery.git
   cd monad-lottery
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file and add your contract address
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
   ```

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is set up for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [Ethers.js](https://docs.ethers.io/) - Ethereum library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Monad](https://monad.xyz/) - Blockchain platform

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This is an unofficial lottery running on the Monad testnet. It is not affiliated with the Monad team or any official Monad entity. The lottery is for entertainment purposes only, and participants should be aware that testnet tokens have no real monetary value.