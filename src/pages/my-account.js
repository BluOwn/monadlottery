import Head from 'next/head';
import Layout from '../components/layout/Layout';
import UserAccount from '../components/account/UserAccount';

const MyAccountPage = () => {
  return (
    <>
      <Head>
        <title>My Account - Monad Lottery</title>
        <meta name="description" content="View your Monad Lottery account details and tickets." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="py-20 bg-white dark:bg-dark-900">
          <div className="container-custom">
            <UserAccount />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default MyAccountPage;