import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import MonadLotteryABI from '../abis/MonadLottery.json';
import { MONAD_LOTTERY_CONTRACT_ADDRESS } from '../constants/contractAddresses';

export const useLottery = () => {
  const { signer, provider, address, isConnected } = useWallet();
  const [contract, setContract] = useState(null);
  const [lotteryStatus, setLotteryStatus] = useState({
    isActive: false,
    totalTickets: 0,
    totalPoolAmount: '0',
    rewardsDistributed: false,
  });
  const [ticketPrice, setTicketPrice] = useState('0.01'); // Default to 0.01 MON
  const [userTickets, setUserTickets] = useState([]);
  const [userTicketCount, setUserTicketCount] = useState(0);
  const [loading, setLoading] = useState(false); // Start with false to avoid UI flicker
  const [initialLoading, setInitialLoading] = useState(true); // Use separate state for initial loading
  const [error, setError] = useState(null);
  const [topBuyer, setTopBuyer] = useState({
    address: null,
    ticketCount: 0,
  });
  
  // Safe fetch wrapper to prevent uncaught promise rejections
  const safeFetch = async (fetchFunction) => {
    try {
      return await fetchFunction();
    } catch (err) {
      console.error('Error in safeFetch:', err);
      return null;
    }
  };

  // Setup contract instance
  useEffect(() => {
    let isMounted = true;
    
    const initContract = async () => {
      if (!provider) {
        if (isMounted) {
          setInitialLoading(false);
        }
        return;
      }
      
      try {
        // Check if provider is ready
        await provider.ready;
        
        const contractRead = new ethers.Contract(
          MONAD_LOTTERY_CONTRACT_ADDRESS,
          MonadLotteryABI,
          provider
        );
        
        if (isMounted) {
          setContract(contractRead);
          setInitialLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error setting up contract:', err);
        if (isMounted) {
          setError('Failed to setup contract instance');
          setInitialLoading(false);
        }
      }
    };
    
    initContract();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [provider]);
  
  // Setup contract instance with signer when connected
  useEffect(() => {
    let isMounted = true;
    
    if (!signer || !contract) return;
    
    const setupSignerContract = async () => {
      try {
        const contractWrite = new ethers.Contract(
          MONAD_LOTTERY_CONTRACT_ADDRESS,
          MonadLotteryABI,
          signer
        );
        
        if (isMounted) {
          setContract(contractWrite);
          setError(null);
        }
      } catch (err) {
        console.error('Error setting up contract with signer:', err);
        if (isMounted) {
          setError('Failed to setup contract with signer');
        }
      }
    };
    
    setupSignerContract();
    
    return () => {
      isMounted = false;
    };
  }, [signer, contract]);
  
  // Fetch lottery status
  const fetchLotteryStatus = useCallback(async () => {
    if (!contract) return null;
    
    let isMounted = true;
    setLoading(true);
    
    try {
      // Safely fetch the status
      const status = await safeFetch(() => contract.getLotteryStatus());
      
      if (!status || !isMounted) return null;
      
      // Safely extract values with fallbacks
      const isActive = status.isActive || false;
      const totalTickets = status.tickets ? Number(status.tickets) : 0;
      const totalPoolAmount = status.pool ? ethers.utils.formatEther(status.pool) : '0';
      const rewardsDistributed = status.awarded || false;
      
      if (isMounted) {
        setLotteryStatus({
          isActive,
          totalTickets,
          totalPoolAmount,
          rewardsDistributed,
        });
      }
      
      // Safely get top buyer data
      const topBuyerData = await safeFetch(() => contract.getTopBuyer());
      
      if (topBuyerData && isMounted) {
        const [topBuyerAddress, topBuyerTicketCount] = topBuyerData;
        setTopBuyer({
          address: topBuyerAddress || null,
          ticketCount: topBuyerTicketCount ? Number(topBuyerTicketCount) : 0,
        });
      }
      
      if (isMounted) {
        setError(null);
      }
      
      return status;
    } catch (err) {
      console.error('Error fetching lottery status:', err);
      if (isMounted) {
        setError('Failed to fetch lottery status');
      }
      return null;
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [contract]);
  
  // Fetch ticket price
  const fetchTicketPrice = useCallback(async () => {
    if (!contract) return null;
    
    let isMounted = true;
    
    try {
      const price = await safeFetch(() => contract.TICKET_PRICE());
      
      if (price && isMounted) {
        setTicketPrice(ethers.utils.formatEther(price));
        setError(null);
      }
      
      return price;
    } catch (err) {
      console.error('Error fetching ticket price:', err);
      if (isMounted) {
        setError('Failed to fetch ticket price');
      }
      return null;
    }
  }, [contract]);
  
  // Fetch user tickets
  const fetchUserTickets = useCallback(async () => {
    if (!contract || !address) return null;
    
    let isMounted = true;
    setLoading(true);
    
    try {
      // Use Promise.all with safeFetch to prevent unhandled rejections
      const [ticketsResult, ticketCountResult] = await Promise.all([
        safeFetch(() => contract.getUserTickets(address)),
        safeFetch(() => contract.getUserTicketCount(address))
      ]);
      
      if (!isMounted) return null;
      
      if (ticketsResult) {
        const processedTickets = ticketsResult.map(t => {
          try {
            return t.toNumber();
          } catch (e) {
            return Number(t.toString());
          }
        });
        setUserTickets(processedTickets);
      } else {
        setUserTickets([]);
      }
      
      if (ticketCountResult) {
        try {
          setUserTicketCount(ticketCountResult.toNumber());
        } catch (e) {
          setUserTicketCount(Number(ticketCountResult.toString()));
        }
      } else {
        setUserTicketCount(0);
      }
      
      setError(null);
      return { tickets: ticketsResult, count: ticketCountResult };
    } catch (err) {
      console.error('Error fetching user tickets:', err);
      if (isMounted) {
        setError('Failed to fetch your tickets');
        // Reset to empty state on error
        setUserTickets([]);
        setUserTicketCount(0);
      }
      return null;
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [contract, address]);
  
  // Buy tickets
  const buyTickets = useCallback(async (numTickets) => {
    if (!contract || !isConnected) {
      setError('Wallet not connected');
      return false;
    }
    
    if (!numTickets || numTickets <= 0) {
      setError('Invalid number of tickets');
      return false;
    }
    
    let isMounted = true;
    setLoading(true);
    
    try {
      // Convert string to float, then ensure we have a valid number
      const ticketPriceFloat = parseFloat(ticketPrice);
      if (isNaN(ticketPriceFloat) || ticketPriceFloat <= 0) {
        throw new Error('Invalid ticket price');
      }
      
      // Calculate total cost with proper string manipulation to avoid floating point issues
      const totalCost = (ticketPriceFloat * numTickets).toFixed(18);
      const value = ethers.utils.parseEther(totalCost);
      
      // Check if we have a valid value
      if (!value || value.isZero()) {
        throw new Error('Invalid transaction value');
      }
      
      const tx = await contract.buyTickets(numTickets, { value });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (!receipt || !isMounted) {
        return false;
      }
      
      // Refresh data after purchase - catch errors individually to prevent complete failure
      try {
        await fetchLotteryStatus();
      } catch (e) {
        console.error('Error refreshing lottery status after purchase:', e);
      }
      
      try {
        await fetchUserTickets();
      } catch (e) {
        console.error('Error refreshing user tickets after purchase:', e);
      }
      
      if (isMounted) {
        setError(null);
      }
      return true;
    } catch (err) {
      console.error('Error buying tickets:', err);
      const errorMessage = err.message || 'Transaction failed';
      // Extract more user-friendly message from ethers error if available
      const friendlyMessage = errorMessage.includes(':') 
        ? errorMessage.split(':')[1].trim() 
        : errorMessage;
      
      if (isMounted) {
        setError(`Failed to buy tickets: ${friendlyMessage}`);
      }
      return false;
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [contract, isConnected, ticketPrice, fetchLotteryStatus, fetchUserTickets]);
  
  // Initial data fetching
  useEffect(() => {
    let isMounted = true;
    
    if (!contract) return;
    
    const fetchInitialData = async () => {
      if (isMounted) {
        setInitialLoading(true);
      }
      
      try {
        // Fetch data sequentially to avoid overwhelming the provider
        await fetchLotteryStatus();
        
        if (isMounted) {
          await fetchTicketPrice();
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        if (isMounted) {
          setError('Failed to load lottery data');
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };
    
    fetchInitialData();
    
    return () => {
      isMounted = false;
    };
  }, [contract, fetchLotteryStatus, fetchTicketPrice]);
  
  // Fetch user's tickets when connected
  useEffect(() => {
    let isMounted = true;
    
    if (contract && address) {
      fetchUserTickets().catch(err => {
        console.error('Error in user tickets effect:', err);
        if (isMounted) {
          setUserTickets([]);
          setUserTicketCount(0);
        }
      });
    } else if (isMounted) {
      setUserTickets([]);
      setUserTicketCount(0);
    }
    
    return () => {
      isMounted = false;
    };
  }, [contract, address, fetchUserTickets]);
  
  return {
    lotteryStatus: lotteryStatus || {
      isActive: false,
      totalTickets: 0,
      totalPoolAmount: '0',
      rewardsDistributed: false,
    },
    ticketPrice: ticketPrice || '0.01',
    userTickets: userTickets || [],
    userTicketCount: userTicketCount || 0,
    loading: loading || initialLoading,
    error,
    topBuyer: topBuyer || {
      address: null,
      ticketCount: 0,
    },
    buyTickets,
    refreshStatus: fetchLotteryStatus,
    refreshUserTickets: fetchUserTickets,
  };
};