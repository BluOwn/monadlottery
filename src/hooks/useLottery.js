import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from './useWallet';
import MonadLotteryABI from '../abis/MonadLottery.json';
import { MONAD_LOTTERY_CONTRACT_ADDRESS } from '../constants/contractAddresses';

// RPC fallback URLs
const RPC_URLS = [
  "https://testnet-rpc.monad.xyz/",
  "https://rpc.sepolia.org", // Backup provider - note: may not work with Monad, just an example
  // Add more fallback URLs if available
];

// Helper for creating providers with exponential backoff
const createProviderWithRetry = async (urls, maxRetries = 3) => {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    for (const url of urls) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(url);
        // Test the provider with a basic call
        await provider.getBlockNumber();
        return provider;
      } catch (err) {
        console.warn(`Provider ${url} failed:`, err);
        lastError = err;
        // Wait with exponential backoff before trying next
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, i)));
      }
    }
  }
  
  throw new Error(`All providers failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
};

export const useLottery = () => {
  const { signer, provider, address, isConnected, isCorrectNetwork } = useWallet();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topBuyer, setTopBuyer] = useState({
    address: null,
    ticketCount: 0,
  });
  
  // Helper to clear error after a timeout
  const clearErrorAfterDelay = useCallback((delay = 5000) => {
    setTimeout(() => {
      setError(null);
    }, delay);
  }, []);
  
  // Setup contract instance with fallback providers
  useEffect(() => {
    let isMounted = true;
    
    const initContract = async () => {
      if (!provider && !isConnected) {
        // If no provider from wallet, create a read-only provider
        try {
          const fallbackProvider = await createProviderWithRetry(RPC_URLS);
          
          if (isMounted) {
            const contractRead = new ethers.Contract(
              MONAD_LOTTERY_CONTRACT_ADDRESS,
              MonadLotteryABI,
              fallbackProvider
            );
            
            setContract(contractRead);
            setError(null);
          }
        } catch (err) {
          console.error('Failed to create fallback provider:', err);
          if (isMounted) {
            setError('Failed to connect to blockchain. Please try again later.');
          }
        }
        return;
      }
      
      try {
        // Create contract with user's provider
        const contractInstance = new ethers.Contract(
          MONAD_LOTTERY_CONTRACT_ADDRESS,
          MonadLotteryABI,
          provider
        );
        
        // If we have a signer, create a writable contract
        const contractWithSigner = signer 
          ? contractInstance.connect(signer)
          : contractInstance;
        
        if (isMounted) {
          setContract(contractWithSigner);
          setError(null);
        }
      } catch (err) {
        console.error('Error setting up contract:', err);
        if (isMounted) {
          setError('Failed to initialize contract');
          clearErrorAfterDelay();
        }
      }
    };
    
    initContract();
    
    return () => {
      isMounted = false;
    };
  }, [provider, signer, isConnected, clearErrorAfterDelay]);
  
  // Function to safely call contract methods with rate limit handling
  const safeContractCall = async (method, ...args) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      // First try with the regular contract
      return await contract[method](...args);
    } catch (err) {
      // Check if this is a rate limit error
      if (
        err.message.includes('rate limit') ||
        err.message.includes('request limit') ||
        err.message.includes('429') ||
        err.message.includes('too many requests')
      ) {
        console.warn('Rate limit hit, trying fallback provider', err);
        
        try {
          // Create a new provider and contract instance
          const fallbackProvider = await createProviderWithRetry(RPC_URLS);
          const fallbackContract = new ethers.Contract(
            MONAD_LOTTERY_CONTRACT_ADDRESS,
            MonadLotteryABI,
            fallbackProvider
          );
          
          // If we need a signer and have one, connect it
          const contractToUse = (method === 'buyTickets' && signer) 
            ? fallbackContract.connect(signer)
            : fallbackContract;
          
          // Retry the call with the fallback
          return await contractToUse[method](...args);
        } catch (fallbackErr) {
          console.error('Fallback provider also failed:', fallbackErr);
          throw new Error(`Rate limit exceeded and fallback failed: ${fallbackErr.message}`);
        }
      }
      
      // Not a rate limit error, rethrow
      throw err;
    }
  };
  
  // Fetch lottery status with retry
  const fetchLotteryStatus = useCallback(async () => {
    if (!contract) return null;
    
    setLoading(true);
    
    try {
      const status = await safeContractCall('getLotteryStatus');
      
      if (!status) return null;
      
      setLotteryStatus({
        isActive: status.isActive || false,
        totalTickets: status.tickets ? Number(status.tickets) : 0,
        totalPoolAmount: status.pool ? ethers.utils.formatEther(status.pool) : '0',
        rewardsDistributed: status.awarded || false,
      });
      
      try {
        const topBuyerData = await safeContractCall('getTopBuyer');
        
        if (topBuyerData) {
          const [topBuyerAddress, topBuyerTicketCount] = topBuyerData;
          setTopBuyer({
            address: topBuyerAddress || null,
            ticketCount: topBuyerTicketCount ? Number(topBuyerTicketCount) : 0,
          });
        }
      } catch (topBuyerErr) {
        console.error('Error fetching top buyer:', topBuyerErr);
      }
      
      setError(null);
      return status;
    } catch (err) {
      console.error('Error fetching lottery status:', err);
      setError('Failed to fetch lottery status. The network may be congested.');
      clearErrorAfterDelay();
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, clearErrorAfterDelay]);
  
  // Fetch ticket price
  const fetchTicketPrice = useCallback(async () => {
    if (!contract) return null;
    
    try {
      const price = await safeContractCall('TICKET_PRICE');
      
      if (price) {
        setTicketPrice(ethers.utils.formatEther(price));
        setError(null);
      }
      
      return price;
    } catch (err) {
      console.error('Error fetching ticket price:', err);
      setError('Failed to fetch ticket price');
      clearErrorAfterDelay();
      return null;
    }
  }, [contract, clearErrorAfterDelay]);
  
  // Fetch user tickets
  const fetchUserTickets = useCallback(async () => {
    if (!contract || !address) return null;
    
    setLoading(true);
    
    try {
      // Try to get tickets and count in parallel
      const [ticketsResult, ticketCountResult] = await Promise.all([
        safeContractCall('getUserTickets', address),
        safeContractCall('getUserTicketCount', address)
      ]);
      
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
      setError('Failed to fetch your tickets. The network may be congested.');
      clearErrorAfterDelay();
      setUserTickets([]);
      setUserTicketCount(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, address, clearErrorAfterDelay]);
  
  // Buy tickets with enhanced reliability
  const buyTickets = useCallback(async (numTickets) => {
    if (!contract || !isConnected) {
      setError('Wallet not connected');
      toast.error('Wallet not connected');
      return false;
    }
    
    if (!isCorrectNetwork) {
      setError('Please switch to Monad Testnet');
      toast.error('Please switch to Monad Testnet');
      return false;
    }
    
    if (!numTickets || numTickets <= 0) {
      setError('Invalid number of tickets');
      toast.error('Invalid number of tickets');
      return false;
    }
    
    if (!lotteryStatus.isActive) {
      setError('Lottery is not active');
      toast.error('Lottery is not active');
      return false;
    }
    
    setLoading(true);
    
    try {
      // Calculate total cost
      const ticketPriceFloat = parseFloat(ticketPrice);
      if (isNaN(ticketPriceFloat) || ticketPriceFloat <= 0) {
        throw new Error('Invalid ticket price');
      }
      
      const totalCost = (ticketPriceFloat * numTickets).toFixed(18);
      const value = ethers.utils.parseEther(totalCost);
      
      // Show pending toast
      const pendingToast = toast.loading(`Buying ${numTickets} ticket${numTickets > 1 ? 's' : ''}...`);
      
      // Retry logic for rate limits
      let success = false;
      let lastError = null;
      
      for (let attempt = 0; attempt < 3 && !success; attempt++) {
        try {
          // Add a small delay between retries
          if (attempt > 0) {
            await new Promise(r => setTimeout(r, 1000 * attempt));
            toast.loading(`Retrying purchase (attempt ${attempt + 1}/3)...`, { id: pendingToast });
          }
          
          // Prepare transaction with higher gas limit to account for network congestion
          const gasEstimate = await contract.estimateGas.buyTickets(numTickets, { value });
          const gasLimit = gasEstimate.mul(150).div(100); // Add 50% buffer
          
          const tx = await safeContractCall('buyTickets', numTickets, { 
            value,
            gasLimit
          });
          
          // Wait for confirmation
          toast.loading(`Transaction submitted. Waiting for confirmation...`, { id: pendingToast });
          const receipt = await tx.wait();
          
          success = true;
          
          // Show success toast
          toast.success(`Successfully purchased ${numTickets} ticket${numTickets > 1 ? 's' : ''}!`, { id: pendingToast });
          
          // Refresh data
          setTimeout(() => {
            fetchLotteryStatus().catch(console.error);
            fetchUserTickets().catch(console.error);
          }, 2000);
          
        } catch (err) {
          lastError = err;
          console.error(`Attempt ${attempt + 1} failed:`, err);
          
          // If not a rate limit error, don't retry
          if (
            !err.message.includes('rate limit') && 
            !err.message.includes('request limit') &&
            !err.message.includes('429') &&
            !err.message.includes('too many requests')
          ) {
            break;
          }
        }
      }
      
      if (!success) {
        // Format a user-friendly error message
        let errorMessage = 'Transaction failed';
        
        if (lastError) {
          if (lastError.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds. Please make sure you have enough MON tokens.';
          } else if (lastError.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (lastError.message.includes('rate limit') || lastError.message.includes('429')) {
            errorMessage = 'Network is congested. Please try again in a moment.';
          } else {
            errorMessage = 'Transaction failed. Network may be congested.';
          }
        }
        
        toast.error(errorMessage, { id: pendingToast });
        setError(errorMessage);
        clearErrorAfterDelay(8000);
        return false;
      }
      
      setError(null);
      return true;
      
    } catch (err) {
      console.error('Error buying tickets:', err);
      
      // Show user-friendly error
      let errorMessage = 'Transaction failed';
      
      if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds. Please make sure you have enough MON tokens.';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('rate limit') || err.message.includes('429')) {
        errorMessage = 'Network is congested. Please try again in a moment.';
      } else {
        errorMessage = 'Transaction failed. Network may be congested.';
      }
      
      toast.error(errorMessage);
      setError(errorMessage);
      clearErrorAfterDelay(8000);
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    contract, 
    isConnected, 
    isCorrectNetwork,
    ticketPrice,
    lotteryStatus,
    fetchLotteryStatus,
    fetchUserTickets,
    clearErrorAfterDelay
  ]);
  
  // Initial data fetch
  useEffect(() => {
    if (contract) {
      fetchLotteryStatus().catch(console.error);
      fetchTicketPrice().catch(console.error);
      
      if (address) {
        fetchUserTickets().catch(console.error);
      }
    }
  }, [contract, address, fetchLotteryStatus, fetchTicketPrice, fetchUserTickets]);
  
  // Set up refresh interval for lottery status
  useEffect(() => {
    if (!contract) return;
    
    const interval = setInterval(() => {
      fetchLotteryStatus().catch(console.error);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [contract, fetchLotteryStatus]);
  
  return {
    lotteryStatus,
    ticketPrice,
    userTickets,
    userTicketCount,
    topBuyer,
    loading,
    error,
    buyTickets,
    refreshStatus: fetchLotteryStatus,
    refreshUserTickets: fetchUserTickets,
  };
};