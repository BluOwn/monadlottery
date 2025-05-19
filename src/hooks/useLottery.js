import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from './useWallet';
import MonadLotteryABI from '../abis/MonadLottery.json';
import { MONAD_LOTTERY_CONTRACT_ADDRESS } from '../constants/contractAddresses';

// Multiple RPC providers with fallbacks
const RPC_URLS = [
  "https://testnet-rpc.monad.xyz/",
  // Add fallback URLs if you have them
];

// Request throttling settings
const THROTTLE = {
  maxRequestsPerSecond: 5, // Set below the 10/sec limit
  requestQueue: [],
  processing: false,
  lastRequestTime: 0
};

// Process the request queue with throttling
const processQueue = async () => {
  if (THROTTLE.processing || THROTTLE.requestQueue.length === 0) return;
  
  THROTTLE.processing = true;
  
  try {
    // Calculate time since last request
    const now = Date.now();
    const timeSinceLastRequest = now - THROTTLE.lastRequestTime;
    
    // If we need to wait to respect rate limit, wait the appropriate time
    if (THROTTLE.lastRequestTime > 0 && timeSinceLastRequest < (1000 / THROTTLE.maxRequestsPerSecond)) {
      const waitTime = (1000 / THROTTLE.maxRequestsPerSecond) - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Take the next request from the queue
    const nextRequest = THROTTLE.requestQueue.shift();
    
    if (nextRequest) {
      THROTTLE.lastRequestTime = Date.now();
      
      try {
        // Execute the request
        const result = await nextRequest.fn();
        nextRequest.resolve(result);
      } catch (error) {
        nextRequest.reject(error);
      }
    }
  } finally {
    THROTTLE.processing = false;
    
    // Continue processing queue if there are more items
    if (THROTTLE.requestQueue.length > 0) {
      setTimeout(processQueue, 1000 / THROTTLE.maxRequestsPerSecond);
    }
  }
};

// Throttled RPC call - adds request to queue
const throttledRpcCall = (fn) => {
  return new Promise((resolve, reject) => {
    // Add to queue
    THROTTLE.requestQueue.push({ fn, resolve, reject });
    
    // Start processing queue if not already in progress
    if (!THROTTLE.processing) {
      processQueue();
    }
  });
};

// Create a provider with retry mechanism and throttling
const createProvider = async (url) => {
  const provider = new ethers.providers.JsonRpcProvider(url);
  
  // Create a wrapper around the provider's call method
  const originalCall = provider.call;
  provider.call = async function(...args) {
    return throttledRpcCall(() => originalCall.apply(provider, args));
  };
  
  // Similarly wrap other commonly used methods
  const methods = ['getBalance', 'getTransactionCount', 'getCode', 'getStorageAt'];
  methods.forEach(method => {
    const original = provider[method];
    if (typeof original === 'function') {
      provider[method] = async function(...args) {
        return throttledRpcCall(() => original.apply(provider, args));
      };
    }
  });
  
  // Test the provider with a basic call
  try {
    await throttledRpcCall(() => provider.getBlockNumber());
    return provider;
  } catch (error) {
    console.error(`Provider ${url} failed:`, error);
    throw error;
  }
};

export const useLottery = () => {
  const { signer, provider: walletProvider, address, isConnected, isCorrectNetwork } = useWallet();
  const [contract, setContract] = useState(null);
  const [readProvider, setReadProvider] = useState(null);
  const [lotteryStatus, setLotteryStatus] = useState({
    isActive: false,
    totalTickets: 0,
    totalPoolAmount: '0',
    rewardsDistributed: false,
  });
  const [ticketPrice, setTicketPrice] = useState('0.01');
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
  
  // Initialize throttled provider
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        // Create a throttled provider
        const provider = await createProvider(RPC_URLS[0]);
        
        if (isMounted) {
          setReadProvider(provider);
        }
      } catch (err) {
        console.error('Failed to initialize provider:', err);
        if (isMounted) {
          setError('Failed to connect to network. Please try again later.');
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Setup contract instance
  useEffect(() => {
    let isMounted = true;
    
    const initContract = async () => {
      // Use wallet provider if available, otherwise use read provider
      const providerToUse = walletProvider || readProvider;
      
      if (!providerToUse) return;
      
      try {
        const contractInstance = new ethers.Contract(
          MONAD_LOTTERY_CONTRACT_ADDRESS,
          MonadLotteryABI,
          providerToUse
        );
        
        // If we have a signer, create a writable contract
        const contractWithSigner = (signer && isConnected) 
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
  }, [walletProvider, readProvider, signer, isConnected, clearErrorAfterDelay]);
  
  // Function to safely call contract methods with throttling
  const safeContractCall = async (method, ...args) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
    // Use throttled calls to avoid rate limiting
    return throttledRpcCall(async () => {
      try {
        // Call the contract method
        return await contract[method](...args);
      } catch (err) {
        console.error(`Error calling ${method}:`, err);
        throw err;
      }
    });
  };
  
  // Fetch lottery status
  const fetchLotteryStatus = useCallback(async () => {
    if (!contract) return null;
    
    setLoading(true);
    
    try {
      // Get lottery status with throttling
      const status = await safeContractCall('getLotteryStatus');
      
      if (!status) return null;
      
      setLotteryStatus({
        isActive: status.isActive || false,
        totalTickets: status.tickets ? Number(status.tickets) : 0,
        totalPoolAmount: status.pool ? ethers.utils.formatEther(status.pool) : '0',
        rewardsDistributed: status.awarded || false,
      });
      
      // Get top buyer with throttling
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
      // Use sequential fetch with throttling to avoid rate limits
      const ticketCountResult = await safeContractCall('getUserTicketCount', address);
      
      let ticketCount = 0;
      if (ticketCountResult) {
        try {
          ticketCount = ticketCountResult.toNumber();
          setUserTicketCount(ticketCount);
        } catch (e) {
          ticketCount = Number(ticketCountResult.toString());
          setUserTicketCount(ticketCount);
        }
      } else {
        setUserTicketCount(0);
      }
      
      // Only fetch tickets if there are any
      if (ticketCount > 0) {
        const ticketsResult = await safeContractCall('getUserTickets', address);
        
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
      } else {
        setUserTickets([]);
      }
      
      setError(null);
      return { count: ticketCount, tickets: userTickets };
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
  
  // Buy tickets with backoff strategy for rate limits
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
    
    // NEW: Limit number of tickets per transaction to 10
    if (numTickets > 10) {
      setError('Maximum 10 tickets per transaction');
      toast.error('Maximum 10 tickets per transaction');
      return false;
    }
    
    if (!lotteryStatus.isActive) {
      setError('Lottery is not active');
      toast.error('Lottery is not active');
      return false;
    }
    
    setLoading(true);
    
    try {
      // FIXED: Use BigNumber math for precise calculations instead of floating point
      // First get the ticket price in wei
      const ticketPriceWei = await safeContractCall('TICKET_PRICE');
      
      if (!ticketPriceWei) {
        throw new Error('Could not get ticket price from contract');
      }
      
      // Calculate total cost using BigNumber math (no floating point errors)
      const totalCostWei = ticketPriceWei.mul(numTickets);
      
      // Log the values for debugging
      console.log('Ticket price (wei):', ticketPriceWei.toString());
      console.log('Number of tickets:', numTickets);
      console.log('Total cost (wei):', totalCostWei.toString());
      console.log('Total cost (ETH):', ethers.utils.formatEther(totalCostWei));
      
      // Show pending toast
      const pendingToast = toast.loading(`Buying ${numTickets} ticket${numTickets > 1 ? 's' : ''}...`);
      
      // Add significant gas buffer for network congestion
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.buyTickets(numTickets, { value: totalCostWei });
        gasEstimate = gasEstimate.mul(150).div(100); // 50% buffer
      } catch (gasErr) {
        console.error('Gas estimation error:', gasErr);
        toast.error('Failed to estimate gas. Network may be congested.', { id: pendingToast });
        setError('Failed to estimate gas. Please try again when network is less congested.');
        clearErrorAfterDelay(8000);
        return false;
      }
      
      // Send transaction with the precise wei amount
      const tx = await contract.buyTickets(numTickets, { 
        value: totalCostWei,
        gasLimit: gasEstimate
      });
      
      toast.loading(`Transaction submitted. Waiting for confirmation...`, { id: pendingToast });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Success!
      toast.success(`Successfully purchased ${numTickets} ticket${numTickets > 1 ? 's' : ''}!`, { id: pendingToast });
      
      // Refresh data with a delay to allow blockchain to update
      setTimeout(() => {
        fetchLotteryStatus().catch(console.error);
        if (address) {
          fetchUserTickets().catch(console.error);
        }
      }, 3000);
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error buying tickets:', err);
      
      // Format a user-friendly error message
      let errorMessage = 'Transaction failed';
      
      if (err.message) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for purchase';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected';
        } else if (err.message.includes('429') || err.message.includes('rate limit')) {
          errorMessage = 'Network is busy. Please try again in a moment.';
        } else if (err.message.includes('Incorrect payment amount')) {
          errorMessage = 'Incorrect payment amount. This is a calculation error, please try again.';
        } else {
          errorMessage = 'Transaction failed. Network may be congested.';
        }
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
    address,
    fetchLotteryStatus,
    fetchUserTickets,
    clearErrorAfterDelay,
    safeContractCall
  ]);
  
  // Initial data fetch
  useEffect(() => {
    if (contract) {
      // Stagger requests to avoid rate limiting
      fetchLotteryStatus().catch(console.error);
      
      // Slight delay before fetching ticket price
      setTimeout(() => {
        fetchTicketPrice().catch(console.error);
      }, 2000);
      
      // Further delay before fetching user tickets
      if (address) {
        setTimeout(() => {
          fetchUserTickets().catch(console.error);
        }, 4000);
      }
    }
  }, [contract, address, fetchLotteryStatus, fetchTicketPrice, fetchUserTickets]);
  
  // Set up refresh interval for lottery status
  useEffect(() => {
    if (!contract) return;
    
    // Refresh lottery status less frequently to avoid rate limiting
    const interval = setInterval(() => {
      fetchLotteryStatus().catch(console.error);
    }, 60000); // Once every minute instead of every 30 seconds
    
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