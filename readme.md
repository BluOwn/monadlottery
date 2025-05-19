# Monad Lottery 🎟️

![Monad Lottery](public/logo.svg)

A decentralized lottery application built on the Monad blockchain testnet, offering a fun way to engage with the blockchain while having a chance to win prizes.

## 🌐 Live Website

[lottery.monadescrow.xyz](https://lottery.monadescrow.xyz)

## 📝 Description

Monad Lottery is an unofficial lottery giveaway running on the Monad testnet. Users can purchase lottery tickets using Monad testnet tokens (MON), with each ticket costing 0.01 MON. The more tickets purchased, the higher the chances of winning. Winners are selected using Google's random number generator.

## ✨ Features

- **Wallet Integration**: Connect seamlessly with Metamask or other Web3 wallets
- **Ticket Purchase**: Buy multiple tickets at once with testnet MON tokens
- **Account Management**: View purchased tickets and personal lottery statistics
- **Top Buyer Rewards**: Special rewards for the user who purchases the most tickets
- **Real-time Updates**: Track lottery statistics and prize pool growth
- **Responsive Design**: Optimized for mobile and desktop experiences

## 💰 Prize Distribution

The total prize pool is distributed as follows:

- **First Place**: 40% of total pool
- **Second Place**: 20% of total pool
- **Third Place**: 10% of total pool
- **Top Buyer**: 10% of total pool
- **Administration**: 20% of total pool

## 🔗 Smart Contract

The lottery is powered by a smart contract deployed on the Monad testnet. The contract handles ticket purchases, tracking ownership, and prize distribution.

**Contract Address**: `0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2`

[View on Monad Explorer](https://testnet.monadexplorer.com/address/0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2)

## 🚀 Getting Started

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
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2
   ```

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Ethers.js](https://docs.ethers.io/) - Ethereum library for wallet integration
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Icons](https://react-icons.github.io/react-icons/) - Icon components

## 📱 Mobile Optimization

The application is fully responsive and optimized for mobile devices, allowing users to:
- Connect wallets on mobile
- Purchase tickets on the go
- View lottery status and personal tickets
- Participate in the lottery from anywhere

## 🔧 Smart Contract Features

- Buy multiple tickets at once
- Automatic prize distribution
- Special reward for top buyer
- View your purchased tickets
- Check lottery status

## 🧪 Testing

The application includes several safety mechanisms:
- Rate limiting protection for RPC calls
- Error handling for network congestion
- Wallet connection status management
- Transaction status feedback

## 🚢 Deployment

This project is set up for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## 📝 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This is an unofficial lottery running on the Monad testnet. It is not affiliated with the Monad team or any official Monad entity. The lottery is for entertainment purposes only, and participants should be aware that testnet tokens have no real monetary value.