import React, { useState } from 'react';
import { FiTicket, FiAward, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useWallet } from '../../hooks/useWallet';
import { useLottery } from '../../hooks/useLottery';
import ConnectWallet from '../shared/ConnectWallet';
import Card from '../shared/Card';
import AlertBox from '../shared/AlertBox';
import LoadingSpinner from '../shared/LoadingSpinner';
import toast from 'react-hot-toast';

// Ticket pagination component
const TicketPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index)}
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
            currentPage === index
              ? 'bg-primary-600 text-white'
              : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

// Ticket grid component
const TicketGrid = ({ tickets }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-lg">
        <FiTicket className="h-12 w-12 text-dark-400 dark:text-dark-500 mx-auto mb-4" />
        <p className="text-dark-600 dark:text-dark-400">
          You haven&apos;t purchased any tickets yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {tickets.map((ticketNumber) => (
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
  );
};

// Account overview component
const AccountOverview = ({ address, userTicketCount, topBuyer, isTopBuyer }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  return (
    <Card 
      title="Account Overview" 
      className="mb-8"
    >
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
    </Card>
  );
};

// Main component
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
  
  const [activePage, setActivePage] = useState(0);
  
  // Group tickets by page for easier viewing
  const ticketsPerPage = 50;
  const ticketPages = [];
  
  if (Array.isArray(userTickets) && userTickets.length > 0) {
    for (let i = 0; i < userTickets.length; i += ticketsPerPage) {
      ticketPages.push(userTickets.slice(i, i + ticketsPerPage));
    }
  }
  
  // Check if user is the top buyer
  const isTopBuyer = address && topBuyer?.address === address;
  
  const handleRefresh = () => {
    if (!isConnected) return;
    
    toast.promise(
      refreshUserTickets(),
      {
        loading: 'Refreshing your tickets...',
        success: 'Your tickets have been refreshed!',
        error: 'Failed to refresh tickets',
      }
    );
  };
  
  const scrollToTicketSection = () => {
    // Redirect to home page with ticket section hash
    window.location.href = '/#ticket-purchase';
  };
  
  // If not connected, show connect wallet message
  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto text-center">
        <Card>
          <FiAlertTriangle className="h-12 w-12 text-dark-500 dark:text-dark-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
            Wallet Not Connected
          </h1>
          <p className="text-dark-600 dark:text-dark-400 mb-6">
            Please connect your wallet to view your account details and tickets.
          </p>
          <ConnectWallet />
        </Card>
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
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <FiRefreshCw />
          )}
          <span>Refresh</span>
        </button>
      </div>
      
      {error && (
        <AlertBox 
          type="error" 
          icon={<FiAlertTriangle />} 
          message={error} 
        />
      )}
      
      {/* Account Overview */}
      <AccountOverview 
        address={address}
        userTicketCount={userTicketCount}
        topBuyer={topBuyer}
        isTopBuyer={isTopBuyer}
      />
      
      {/* Ticket List */}
      <Card title={`My Tickets (${userTicketCount})`}>
        <div className="flex items-center justify-between mb-4">
          <div></div> {/* Empty div to maintain space for flex layout */}
          
          {lotteryStatus?.isActive && (
            <button
              onClick={scrollToTicketSection}
              className="btn-primary"
            >
              <FiTicket className="h-4 w-4" />
              <span>Buy More Tickets</span>
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading your tickets..." center />
          </div>
        ) : (
          <>
            {/* Pagination */}
            <TicketPagination 
              currentPage={activePage}
              totalPages={ticketPages.length}
              onPageChange={setActivePage}
            />
            
            {/* Ticket grid */}
            <TicketGrid 
              tickets={ticketPages[activePage] || []}
            />
            
            {/* Bottom pagination for mobile */}
            <div className="mt-6 sm:hidden">
              <TicketPagination 
                currentPage={activePage}
                totalPages={ticketPages.length}
                onPageChange={setActivePage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default UserAccount;