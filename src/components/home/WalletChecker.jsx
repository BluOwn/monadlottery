import React, { useState } from 'react';
import { FiSearch, FiTicket } from 'react-icons/fi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import { MONAD_LOTTERY_CONTRACT_ADDRESS } from '../../constants/contractAddresses';
import MonadLotteryABI from '../../abis/MonadLottery.json';

const WalletChecker = () => {
  const [address, setAddress] = useState('');
  const [ticketCount, setTicketCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to validate Ethereum address
  const isValidAddress = (addr) => {
    try {
      return ethers.utils.isAddress(addr);
    } catch (e) {
      return false;
    }
  };
  
  // Function to check tickets for an address
  const checkTickets = async () => {
    // Reset states
    setTicketCount(null);
    setError(null);
    
    // Validate address
    if (!address || !isValidAddress(address)) {
      setError('Please enter a valid wallet address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Connect to provider
      const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
      
      // Create contract instance
      const contract = new ethers.Contract(
        MONAD_LOTTERY_CONTRACT_ADDRESS,
        MonadLotteryABI,
        provider
      );
      
      // Get user ticket count
      const count = await contract.getUserTicketCount(address);
      setTicketCount(count.toNumber());
      
    } catch (err) {
      console.error('Error checking tickets:', err);
      setError('Failed to fetch ticket information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    checkTickets();
  };
  
  // Handle input change
  const handleChange = (e) => {
    setAddress(e.target.value);
    // Clear previous results when address changes
    setTicketCount(null);
    setError(null);
  };
  
  return (
    <Card className="mt-16">
      <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
        Check Wallet Tickets
      </h2>
      
      <p className="text-dark-600 dark:text-dark-400 mb-6">
        Enter any wallet address to check how many lottery tickets it has purchased.
      </p>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={address}
              onChange={handleChange}
              placeholder="Enter wallet address (0x...)"
              className="w-full px-4 py-2 rounded-lg border border-dark-300 dark:border-dark-600 
                bg-white dark:bg-dark-700 text-dark-900 dark:text-white 
                focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <FiSearch className="h-5 w-5" />
            )}
            <span>Check</span>
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 
          rounded-lg p-4 mb-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      {ticketCount !== null && !error && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 
          dark:border-green-800 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-800">
              <FiTicket className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
            Wallet Tickets
          </h3>
          
          <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-500 mb-2">
            {ticketCount}
          </p>
          
          <p className="text-dark-600 dark:text-dark-400">
            {ticketCount === 0 
              ? "This wallet hasn't purchased any tickets yet." 
              : `This wallet has purchased ${ticketCount} lottery ticket${ticketCount !== 1 ? 's' : ''}.`}
          </p>
        </div>
      )}
    </Card>
  );
};

export default WalletChecker;