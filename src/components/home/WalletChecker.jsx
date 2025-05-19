import React, { useState } from 'react';
import { ethers } from 'ethers';

// Super simple WalletChecker component with no external dependencies
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
      // Use the contract data from your environment variables
      const contractAddress = '0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2';
      
      // Simple ABI just for getUserTicketCount
      const abi = [
        "function getUserTicketCount(address user) view returns (uint256)"
      ];
      
      // Connect to provider
      const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
      
      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        provider
      );
      
      // Add a timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });
      
      // Get user ticket count with timeout
      const result = await Promise.race([
        contract.getUserTicketCount(address),
        timeoutPromise
      ]);
      
      // Convert result to number
      const count = typeof result === 'object' ? result.toNumber() : Number(result);
      setTicketCount(count);
      
    } catch (err) {
      console.error('Error checking tickets:', err);
      if (err.message && err.message.includes('429')) {
        setError('Network is busy. Please try again in a moment.');
      } else if (err.message && err.message.includes('timeout')) {
        setError('Request timed out. Network may be congested.');
      } else {
        setError('Failed to fetch ticket information. Please try again.');
      }
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
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mt-16">
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
              <span>Loading...</span>
            ) : (
              <span>Check</span>
            )}
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
    </div>
  );
};

export default WalletChecker;