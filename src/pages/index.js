import Head from 'next/head';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import LotteryInfo from '../components/home/LotteryInfo';
import TicketPurchase from '../components/home/TicketPurchase';
import PrizeInfo from '../components/home/PrizeInfo';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <>
      <Head>
        <title>Monad Lottery - Unofficial Lottery Giveaway on Monad Testnet</title>
        <meta name="description" content="Participate in the unofficial lottery giveaway on Monad testnet. Buy tickets and get a chance to win prizes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Layout>
        <Toaster position="top-right" />
        <Hero />
        <LotteryInfo />
        <TicketPurchase />
        <PrizeInfo />
      </Layout>
    </>
  );
}