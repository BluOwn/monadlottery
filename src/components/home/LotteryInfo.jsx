import { useEffect } from 'react';
import { FiUsers, FiDollarSign, FiActivity, FiAward } from 'react-icons/fi';
import { useLottery } from '../../hooks/useLottery';

const LotteryInfo = () => {
  const { lotteryStatus, loading, error, refreshStatus, topBuyer } = useLottery();

  useEffect(() => {
    // Refresh lottery status every 30 seconds
    const interval = setInterval(() => {
      refreshStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshStatus]);

  const stats = [
    {
      name: 'Total Tickets',
      value: lotteryStatus.totalTickets.toLocaleString(),
      icon: <FiUsers className="h-5 w-5 text-primary-600" />,
      description: 'Tickets sold in this lottery round',
    },
    {
      name: 'Prize Pool',
      value: `${parseFloat(lotteryStatus.totalPoolAmount).toFixed(2)} MON`,
      icon: <FiDollarSign className="h-5 w-5 text-secondary-600" />,
      description: 'Total amount to be distributed as prizes',
    },
    {
      name: 'Status',
      value: lotteryStatus.isActive ? 'Active' : 'Closed',
      icon: <FiActivity className="h-5 w-5 text-accent-500" />,
      description: lotteryStatus.isActive 
        ? 'Lottery is active and accepting tickets' 
        : 'Lottery is closed, no more tickets can be purchased',
    },
    {
      name: 'Top Buyer',
      value: topBuyer.address ? `${topBuyer.ticketCount} tickets` : 'No buyers yet',
      icon: <FiAward className="h-5 w-5 text-primary-600" />,
      description: 'Top buyer will receive a special reward',
    },
  ];

  return (
    <div className="py-16 bg-white dark:bg-dark-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
            Lottery Information
          </h2>
          <p className="text-dark-600 dark:text-dark-400 max-w-3xl mx-auto">
            Stay updated with the latest lottery statistics. The prize pool grows with each ticket purchase.
          </p>
        </div>

        {loading && (
          <div className="text-center text-dark-500 dark:text-dark-400 my-4">
            Loading lottery data...
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 my-4">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="card border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-full">
                  {stat.icon}
                </div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
                  {stat.name}
                </h3>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-dark-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {lotteryStatus.isActive && (
          <div className="text-center mt-8">
            <button
              onClick={refreshStatus}
              className="btn-outline"
              disabled={loading}
            >
              Refresh Statistics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LotteryInfo;