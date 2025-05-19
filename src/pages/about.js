import Head from 'next/head';
import Layout from '../components/layout/Layout';

const AboutPage = () => {
  return (
    <>
      <Head>
        <title>About - Monad Lottery</title>
        <meta name="description" content="Learn more about the Monad Lottery - an unofficial lottery giveaway on Monad testnet." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="py-20 bg-white dark:bg-dark-900">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-dark-900 dark:text-white mb-8">
                About Monad Lottery
              </h1>

              <div className="prose dark:prose-invert prose-lg max-w-none">
                <p>
                  The Monad Lottery is an unofficial lottery giveaway running on the Monad testnet. 
                  It provides a fun way to engage with the Monad blockchain while having a chance to win prizes.
                </p>

                <h2>How It Works</h2>
                <p>
                  Participants can purchase lottery tickets using Monad testnet tokens (MON). 
                  Each ticket costs 0.01 MON and gives you an entry into the lottery drawing. 
                  The more tickets you purchase, the higher your chances of winning.
                </p>

                <h2>Prize Distribution</h2>
                <p>
                  The total prize pool is distributed as follows:
                </p>
                <ul>
                  <li><strong>First Place (40%):</strong> The holder of the first winning ticket receives 40% of the total prize pool.</li>
                  <li><strong>Second Place (20%):</strong> The holder of the second winning ticket receives 20% of the total prize pool.</li>
                  <li><strong>Third Place (10%):</strong> The holder of the third winning ticket receives 10% of the total prize pool.</li>
                  <li><strong>Top Buyer (10%):</strong> The person who purchases the most tickets receives 10% of the prize pool.</li>
                  <li><strong>Administration (20%):</strong> The remaining 20% is used for administration and maintenance of the lottery system.</li>
                </ul>

                <h2>Winner Selection</h2>
                <p>
                  Winners are selected using Google's random number generator. The winning ticket numbers are chosen 
                  at random, and prizes are automatically distributed to the winners' wallets once the lottery round concludes.
                </p>

                <h2>Transparency</h2>
                <p>
                  The Monad Lottery operates on a smart contract deployed on the Monad testnet. 
                  All transactions, ticket purchases, and prize distributions are recorded on the blockchain, 
                  ensuring full transparency and fairness for all participants.
                </p>

                <h2>Disclaimer</h2>
                <p>
                  This is an unofficial lottery running on the Monad testnet. It is not affiliated with 
                  the Monad team or any official Monad entity. The lottery is for entertainment purposes only, 
                  and participants should be aware that testnet tokens have no real monetary value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AboutPage;