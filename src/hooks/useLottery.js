import { useEffect } from 'react';
import useLotteryStore from '../store/lotteryStore';
import useWalletStore from '../store/walletStore';

export const useLottery = () => {
  const { address, isConnected, provider, signer } = useWalletStore();
  
  const {
    lotteryStatus,
    ticketPrice,
    userTickets,
    userTicketCount,
    topBuyer,
    loading,
    error,
    contract,
    initContract,
    fetchLotteryStatus,
    fetchTicketPrice,
    fetchUserTickets,
    buyTickets,
    clearError
  } = useLotteryStore();
  
  // Initialize contract when provider changes
  useEffect(() => {
    if (provider) {
      initContract(provider, signer);
    }
  }, [provider, signer, initContract]);
  
  // Fetch initial lottery data when contract is set
  useEffect(() => {
    if (contract) {
      fetchLotteryStatus();
      fetchTicketPrice();
    }
  }, [contract, fetchLotteryStatus, fetchTicketPrice]);
  
  // Fetch user tickets when address changes
  useEffect(() => {
    if (contract && address) {
      fetchUserTickets(address);
    }
  }, [contract, address, fetchUserTickets]);
  
  // Set up auto-refresh for lottery status
  useEffect(() => {
    if (!contract) return;
    
    // Refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchLotteryStatus();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [contract, fetchLotteryStatus]);
  
  // Helper to clear error after delay
  useEffect(() => {
    if (error) {
      const timerId = setTimeout(() => {
        clearError();
      }, 8000);
      
      return () => clearTimeout(timerId);
    }
  }, [error, clearError]);
  
  // Wrap buyTickets to use the current signer
  const handleBuyTickets = async (numTickets) => {
    if (!signer) return false;
    return await buyTickets(numTickets, signer);
  };
  
  // Refresh functions for components
  const refreshStatus = () => {
    if (contract) {
      return fetchLotteryStatus();
    }
    return Promise.resolve(null);
  };
  
  const refreshUserTickets = () => {
    if (contract && address) {
      return fetchUserTickets(address);
    }
    return Promise.resolve(null);
  };
  
  return {
    lotteryStatus,
    ticketPrice,
    userTickets,
    userTicketCount,
    topBuyer,
    loading,
    error,
    buyTickets: handleBuyTickets,
    refreshStatus,
    refreshUserTickets
  };
};

export default useLottery;