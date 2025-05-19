import Head from 'next/head';
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import UserAccount from '../components/account/UserAccount';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Simple MyAccountPage component with a short loading delay
const MyAccountPage = () => {
  const [pageReady, setPageReady] = useState(false);
  
  // Add a slight delay to ensure components are fully mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
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
            {!pageReady ? (
              <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" text="Loading account information..." center />
              </div>
            ) : (
              <UserAccount />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default MyAccountPage;