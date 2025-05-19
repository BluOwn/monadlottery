import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useLottery } from '../../hooks/useLottery';
import { FiTicket, FiAward, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import ConnectWallet from '../shared/ConnectWallet';

const UserAccount = () => {
  const { isConnected, address } = useWallet();
  const { 
    userTickets, 
    userTicketCount,
    lotteryStatus,
    topBuyer,
    loading, 
    error,
    refreshUserTickets
  } = useLottery();
  
  const [activePage, setActivePage] = React.useState(0);
  
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  const isTopBuyer = address && topBuyer.address === address;
  
  // Group tickets by page for easier viewing
  const ticketsPerPage = 50;
  const ticketPages = [];
  
  if (userTickets.length > 0) {
    for (let i = 0; i < userTickets.length; i += ticketsPerPage) {
      ticketPages.push(userTickets.slice(i, i + ticketsPerPage));
    }
  }
  
  const handleRefresh = () => {
    if (!isConnected) return;
    refreshUserTickets();
  };
  
  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto text-center card">
        <FiAlertTriangle className="h-12 w-12 text-dark-500 dark:text-dark-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
          Wallet Not Connected
        </h1>
        <p className="text-dark-600 dark:text-dark-400 mb-6">
          Please connect your wallet to view your account details and tickets.
        </p>
        <ConnectWallet />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
          My Account
        </h1>
        <button
          onClick={handleRefresh}
          className="btn-outline"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
          <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Account Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-4">
          Account Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-dark-500 dark:text-dark-400 block mb-1">
                Wallet Address
              </span>
              <span className="font-mono text-dark-800 dark:text-dark-200">
                {address}
              </span>
            </div>
            
            <div>
              <span className="text-sm text-dark-500 dark:text-dark-400 block mb-1">
                Total Tickets Purchased
              </span>
              <span className="text-lg font-bold text-dark-800 dark:text-dark-200">
                {userTicketCount}
              </span>
            </div>
          </div>
          
          <div>
            {isTopBuyer && (
              <div className="flex items-center gap-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                <div className="p-2 bg-amber-200 dark:bg-amber-800 rounded-full">
                  <FiAward className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 dark:text-amber-300">
                    Top Buyer
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Congratulations! You are currently the top buyer with {topBuyer.ticketCount} tickets!
                  </p>
                </div>
              </div>
            )}
            
            {!isTopBuyer && topBuyer.address && (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-dark-500 dark:text-dark-400 block mb-1">
                    Current Top Buyer
                  </span>
                  <span className="font-medium text-dark-800 dark:text-dark-200">
                    {formatAddress(topBuyer.address)} with {topBuyer.ticketCount} tickets
                  </span>
                </div>
                
                {userTicketCount > 0 && (
                  <div>
                    <span className="text-sm text-dark-500 dark:text-dark-400 block mb-1">
                      Tickets Needed to Become Top Buyer
                    </span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-500">
                      {topBuyer.ticketCount - userTicketCount + 1}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Ticket List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
            My Tickets ({userTicketCount})
          </h2>
          
          {lotteryStatus.isActive && (
            
              href="/#ticket-purchase"
              className="btn-primary"
            >
              <FiTicket className="h-4 w-4" />
              <span>Buy More Tickets</span>
            </a>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-dark-600 dark:text-dark-400">
              Loading your tickets...
            </p>
          </div>
        ) : userTickets.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-lg">
            <FiTicket className="h-12 w-12 text-dark-400 dark:text-dark-500 mx-auto mb-4" />
            <p className="text-dark-600 dark:text-dark-400 mb-4">
              You haven&apos;t purchased any tickets yet.
            </p>
            {lotteryStatus.isActive && (
              
                href="/#ticket-purchase"
                className="btn-primary inline-flex"
              >
                <span>Buy Tickets</span>
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Pagination */}
            {ticketPages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                {ticketPages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePage(index)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      activePage === index
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
            
            {/* Ticket grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {ticketPages[activePage] && ticketPages[activePage].map((ticketNumber) => (
                <div
                  key={ticketNumber}
                  className="border border-dark-200 dark:border-dark-700 rounded-lg p-3 text-center bg-dark-50 dark:bg-dark-800"
                >
                  <FiTicket className="h-5 w-5 text-primary-600 dark:text-primary-500 mx-auto mb-1" />
                  <span className="font-mono text-dark-800 dark:text-dark-200">
                    #{ticketNumber}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Bottom pagination for mobile */}
            {ticketPages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 sm:hidden">
                {ticketPages.map((_, index) => (
                  <button
                    key={`bottom-${index}`}
                    onClick={() => setActivePage(index)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      activePage === index
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserAccount;