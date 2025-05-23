import React from 'react';
import { useLottery } from '../../hooks/useLottery';

// Let's temporarily comment out the icon imports to see if that's causing the issue
// import { FiAward, FiTrophy, FiGift } from 'react-icons/fi';

const PrizeInfo = () => {
  const { lotteryStatus, loading, error } = useLottery();

  // Ensure totalPoolAmount exists with a fallback to 0
  const totalPoolAmount = parseFloat(lotteryStatus?.totalPoolAmount || '0');

  const firstPlacePrize = totalPoolAmount * 0.4;
  const secondPlacePrize = totalPoolAmount * 0.2;
  const thirdPlacePrize = totalPoolAmount * 0.1;
  const topBuyerPrize = totalPoolAmount * 0.1;

  // Handle loading state
  if (loading) {
    return (
      <div className="py-16 bg-white dark:bg-dark-900">
        <div className="container-custom text-center">
          <p className="text-dark-600 dark:text-dark-400">Loading prize information...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="py-16 bg-white dark:bg-dark-900">
        <div className="container-custom text-center">
          <p className="text-red-500">Error loading prize information. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white dark:bg-dark-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
            Prize Distribution
          </h2>
          <p className="text-dark-600 dark:text-dark-400 max-w-3xl mx-auto">
            See how the lottery prize pool is distributed among winners. 
            The more tickets you buy, the higher your chances of winning!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* First Place */}
          <div className="card text-center border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-center mb-4">
              {/* <FiTrophy className="h-12 w-12 text-yellow-500" /> */}
              <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center text-white">1</div>
            </div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
              First Place
            </h3>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
              {firstPlacePrize.toFixed(2)} MON
            </div>
            <div className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
              40% of pool
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              First place winner gets 40% of the total prize pool
            </p>
          </div>

          {/* Second Place */}
          <div className="card text-center border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-center mb-4">
              {/* <FiAward className="h-12 w-12 text-gray-400" /> */}
              <div className="h-12 w-12 bg-gray-400 rounded-full flex items-center justify-center text-white">2</div>
            </div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
              Second Place
            </h3>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
              {secondPlacePrize.toFixed(2)} MON
            </div>
            <div className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
              20% of pool
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Second place winner gets 20% of the total prize pool
            </p>
          </div>

          {/* Third Place */}
          <div className="card text-center border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-center mb-4">
              {/* <FiAward className="h-12 w-12 text-amber-700" /> */}
              <div className="h-12 w-12 bg-amber-700 rounded-full flex items-center justify-center text-white">3</div>
            </div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
              Third Place
            </h3>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
              {thirdPlacePrize.toFixed(2)} MON
            </div>
            <div className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
              10% of pool
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Third place winner gets 10% of the total prize pool
            </p>
          </div>

          {/* Top Buyer */}
          <div className="card text-center border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-center mb-4">
              {/* <FiGift className="h-12 w-12 text-primary-600" /> */}
              <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center text-white">★</div>
            </div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
              Top Buyer
            </h3>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
              {topBuyerPrize.toFixed(2)} MON
            </div>
            <div className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
              10% of pool
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              The person who buys the most tickets gets 10% of the prize pool
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-dark-50 dark:bg-dark-800 p-6 rounded-lg inline-block max-w-2xl">
            <p className="text-dark-700 dark:text-dark-300">
              <strong>Note:</strong> Winners will be selected using Google&apos;s random number generator. 
              Each ticket has an equal chance of winning. The remaining 20% of the prize pool goes to 
              maintaining the lottery system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeInfo;