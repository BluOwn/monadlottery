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

// DEBUG LOGGER
const logDebug = (message, data = null) => {
  console.log(`[LOTTERY DEBUG] ${message}`, data || '');
};

export const useLottery = () => {
  logDebug('Initializing useLottery hook');
  
  const { signer, provider: walletProvider, readProvider, address, isConnected, isCorrectNetwork } = useWallet();
  const [contract, setContract] = useState(null);
  const [readContract, setReadContract] = useState(null); // Separate read-only contract
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
  
  // Initialize read contract (this runs whenever readProvider changes)
  useEffect(() => {
    if (!readProvider) {
      logDebug('No read provider available yet');
      return;
    }
    
    logDebug('Initializing read contract with provider', readProvider);
    
    try {
      // Initialize read-only contract
      const contractInstance = new ethers.Contract(
        MONAD_LOTTERY_CONTRACT_ADDRESS,
        MonadLotteryABI,
        readProvider
      );
      
      logDebug('Read contract initialized successfully');
      setReadContract(contractInstance);
      setError(null);
    } catch (err) {
      console.error('Error initializing read contract:', err);
      setError('Failed to initialize contract with read provider');
    }
  }, [readProvider]);
  
  // Setup writable contract instance when wallet connects
  useEffect(() => {
    if (!walletProvider || !signer || !isConnected) {
      if (!walletProvider) logDebug('No wallet provider available');
      if (!signer) logDebug('No signer available');
      if (!isConnected) logDebug('Wallet not connected');
      return;
    }
    
    logDebug('Initializing writable contract with wallet provider', { walletProvider, signer });
    
    try {
      const contractInstance = new ethers.Contract(
        MONAD_LOTTERY_CONTRACT_ADDRESS,
        MonadLotteryABI,
        signer
      );
      
      logDebug('Writable contract initialized successfully');
      setContract(contractInstance);
      setError(null);
    } catch (err) {
      console.error('Error setting up writable contract:', err);
      setError('Failed to initialize contract with wallet');
      clearErrorAfterDelay();
    }
  }, [walletProvider, signer, isConnected, clearErrorAfterDelay]);
  
  // Function to safely call contract methods with throttling
  const safeContractCall = async (contractObj, method, ...args) => {
    if (!contractObj) {
      throw new Error(`Contract not initialized for method ${method}`);
    }
    
    logDebug(`Calling contract method: ${method}`, { args });
    
    // Use throttled calls to avoid rate limiting
    return throttledRpcCall(async () => {
      try {
        // Call the contract method
        const result = await contractObj[method](...args);
        logDebug(`Contract call ${method} successful`, result);
        return result;
      } catch (err) {
        console.error(`Error calling ${method}:`, err);
        throw err;
      }
    });
  };
  
  // Fetch lottery status using the appropriate contract
  const fetchLotteryStatus = useCallback(async () => {
    logDebug('Fetching lottery status');
    
    // Use read-only contract if available, otherwise use writable contract
    const contractToUse = readContract || contract;
    
    if (!contractToUse) {
      console.error('No contract available for fetching lottery status');
      setError('Cannot fetch lottery status: No contract available');
      return null;
    }
    
    setLoading(true);
    
    try {
      // Get lottery status with throttling
      logDebug('Calling getLotteryStatus on contract', contractToUse);
      const status = await safeContractCall(contractToUse, 'getLotteryStatus');
      
      if (!status) {
        logDebug('getLotteryStatus returned null or undefined');
        return null;
      }
      
      logDebug('Lottery status received', status);
      
      const updatedStatus = {
        isActive: status.isActive || false,
        totalTickets: status.tickets ? Number(status.tickets) : 0,
        totalPoolAmount: status.pool ? ethers.utils.formatEther(status.pool) : '0',
        rewardsDistributed: status.awarded || false,
      };
      
      logDebug('Processed lottery status', updatedStatus);
      setLotteryStatus(updatedStatus);
      
      // Get top buyer with throttling
      try {
        logDebug('Fetching top buyer');
        const topBuyerData = await safeContractCall(contractToUse, 'getTopBuyer');
        
        if (topBuyerData) {
          const [topBuyerAddress, topBuyerTicketCount] = topBuyerData;
          setTopBuyer({
            address: topBuyerAddress || null,
            ticketCount: topBuyerTicketCount ? Number(topBuyerTicketCount) : 0,
          });
          logDebug('Top buyer data', { address: topBuyerAddress, ticketCount: topBuyerTicketCount });
        }
      } catch (topBuyerErr) {
        console.error('Error fetching top buyer:', topBuyerErr);
        logDebug('Error fetching top buyer', topBuyerErr);
      }
      
      setError(null);
      return status;
    } catch (err) {
      console.error('Error fetching lottery status:', err);
      logDebug('Error fetching lottery status', err);
      setError('Failed to fetch lottery status. The network may be congested.');
      clearErrorAfterDelay();
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, readContract, clearErrorAfterDelay]);
  
  // Fetch ticket price
  const fetchTicketPrice = useCallback(async () => {
    logDebug('Fetching ticket price');
    
    // Use read-only contract if available, otherwise use writable contract
    const contractToUse = readContract || contract;
    
    if (!contractToUse) {
      console.error('No contract available for fetching ticket price');
      return null;
    }
    
    try {
      const price = await safeContractCall(contractToUse, 'TICKET_PRICE');
      
      if (price) {
        const formattedPrice = ethers.utils.formatEther(price);
        logDebug('Ticket price received', { raw: price.toString(), formatted: formattedPrice });
        setTicketPrice(formattedPrice);
        setError(null);
      } else {
        logDebug('No ticket price returned from contract');
      }
      
      return price;
    } catch (err) {
      console.error('Error fetching ticket price:', err);
      logDebug('Error fetching ticket price', err);
      setError('Failed to fetch ticket price');
      clearErrorAfterDelay();
      return null;
    }
  }, [contract, readContract, clearErrorAfterDelay]);
  
  // Fetch user tickets - requires wallet connection
  const fetchUserTickets = useCallback(async () => {
    logDebug('Fetching user tickets', { address });
    
    // We need the writable contract for user-specific data
    if (!contract || !address) {
      logDebug('Cannot fetch user tickets: missing contract or address', { contract: !!contract, address });
      return null;
    }
    
    setLoading(true);
    
    try {
      // Use sequential fetch with throttling to avoid rate limits
      const ticketCountResult = await safeContractCall(contract, 'getUserTicketCount', address);
      
      logDebug('User ticket count result', ticketCountResult);
      
      let ticketCount = 0;
      if (ticketCountResult) {
        try {
          ticketCount = ticketCountResult.toNumber();
          setUserTicketCount(ticketCount);
          logDebug('User ticket count', ticketCount);
        } catch (e) {
          ticketCount = Number(ticketCountResult.toString());
          setUserTicketCount(ticketCount);
          logDebug('User ticket count (from string)', ticketCount);
        }
      } else {
        setUserTicketCount(0);
        logDebug('No ticket count result, setting to 0');
      }
      
      // Only fetch tickets if there are any
      if (ticketCount > 0) {
        logDebug('Fetching user tickets for count > 0');
        const ticketsResult = await safeContractCall(contract, 'getUserTickets', address);
        
        if (ticketsResult) {
          const processedTickets = ticketsResult.map(t => {
            try {
              return t.toNumber();
            } catch (e) {
              return Number(t.toString());
            }
          });
          setUserTickets(processedTickets);
          logDebug('User tickets processed', processedTickets);
        } else {
          setUserTickets([]);
          logDebug('No tickets result, setting empty array');
        }
      } else {
        setUserTickets([]);
        logDebug('Ticket count is 0, setting empty array');
      }
      
      setError(null);
      return { count: ticketCount, tickets: userTickets };
    } catch (err) {
      console.error('Error fetching user tickets:', err);
      logDebug('Error fetching user tickets', err);
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
    logDebug('Buying tickets', { numTickets });
    
    if (!contract || !isConnected) {
      logDebug('Cannot buy tickets: not connected', { contract: !!contract, isConnected });
      setError('Wallet not connected');
      toast.error('Wallet not connected');
      return false;
    }
    
    if (!isCorrectNetwork) {
      logDebug('Cannot buy tickets: wrong network', { isCorrectNetwork });
      setError('Please switch to Monad Testnet');
      toast.error('Please switch to Monad Testnet');
      return false;
    }
    
    if (!numTickets || numTickets <= 0) {
      logDebug('Cannot buy tickets: invalid quantity', { numTickets });
      setError('Invalid number of tickets');
      toast.error('Invalid number of tickets');
      return false;
    }
    
    // Limit number of tickets per transaction to 10
    if (numTickets > 10) {
      logDebug('Cannot buy tickets: too many tickets', { numTickets });
      setError('Maximum 10 tickets per transaction');
      toast.error('Maximum 10 tickets per transaction');
      return false;
    }
    
    if (!lotteryStatus.isActive) {
      logDebug('Cannot buy tickets: lottery inactive', { lotteryStatus });
      setError('Lottery is not active');
      toast.error('Lottery is not active');
      return false;
    }
    
    setLoading(true);
    
    try {
      // Use BigNumber math for precise calculations
      logDebug('Getting ticket price from contract');
      const ticketPriceWei = await safeContractCall(contract, 'TICKET_PRICE');
      
      if (!ticketPriceWei) {
        throw new Error('Could not get ticket price from contract');
      }
      
      // Calculate total cost using BigNumber math (no floating point errors)
      const totalCostWei = ticketPriceWei.mul(numTickets);
      
      // Log the values for debugging
      logDebug('Purchase calculations', {
        ticketPriceWei: ticketPriceWei.toString(),
        numTickets,
        totalCostWei: totalCostWei.toString(),
        totalCostEth: ethers.utils.formatEther(totalCostWei)
      });
      
      // Show pending toast
      const pendingToast = toast.loading(`Buying ${numTickets} ticket${numTickets > 1 ? 's' : ''}...`);
      
      // Add significant gas buffer for network congestion
      let gasEstimate;
      try {
        logDebug('Estimating gas for purchase');
        gasEstimate = await contract.estimateGas.buyTickets(numTickets, { value: totalCostWei });
        gasEstimate = gasEstimate.mul(150).div(100); // 50% buffer
        logDebug('Gas estimation successful', { 
          original: gasEstimate.div(150).mul(100).toString(),
          withBuffer: gasEstimate.toString()
        });
      } catch (gasErr) {
        console.error('Gas estimation error:', gasErr);
        logDebug('Gas estimation error', gasErr);
        toast.error('Failed to estimate gas. Network may be congested.', { id: pendingToast });
        setError('Failed to estimate gas. Please try again when network is less congested.');
        clearErrorAfterDelay(8000);
        return false;
      }
      
      // Send transaction with the precise wei amount
      logDebug('Sending buyTickets transaction');
      const tx = await contract.buyTickets(numTickets, { 
        value: totalCostWei,
        gasLimit: gasEstimate
      });
      
      logDebug('Transaction sent', { hash: tx.hash });
      toast.loading(`Transaction submitted. Waiting for confirmation...`, { id: pendingToast });
      
      // Wait for confirmation
      logDebug('Waiting for transaction confirmation');
      const receipt = await tx.wait();
      logDebug('Transaction confirmed', { 
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });
      
      // Success!
      toast.success(`Successfully purchased ${numTickets} ticket${numTickets > 1 ? 's' : ''}!`, { id: pendingToast });
      
      // Refresh data with a delay to allow blockchain to update
      setTimeout(() => {
        logDebug('Refreshing data after purchase');
        fetchLotteryStatus().catch(err => {
          console.error('Error refreshing lottery status after purchase:', err);
          logDebug('Error refreshing lottery status after purchase', err);
        });
        
        if (address) {
          fetchUserTickets().catch(err => {
            console.error('Error refreshing user tickets after purchase:', err);
            logDebug('Error refreshing user tickets after purchase', err);
          });
        }
      }, 3000);
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error buying tickets:', err);
      logDebug('Error buying tickets', err);
      
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
      
      logDebug('Purchase error message', errorMessage);
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
    lotteryStatus,
    address,
    fetchLotteryStatus,
    fetchUserTickets,
    clearErrorAfterDelay
  ]);
  
  // Fetch initial data when components load
  useEffect(() => {
    // First check if we have any contract available (read or write)
    const contractToUse = readContract || contract;
    
    if (contractToUse) {
      logDebug('Contract available, fetching initial data', { 
        readContract: !!readContract, 
        contract: !!contract
      });
      
      // Fetch public data immediately
      const fetchInitialData = async () => {
        setLoading(true);
        try {
          await fetchLotteryStatus();
          await fetchTicketPrice();
        } catch (err) {
          console.error('Error fetching initial lottery data:', err);
          logDebug('Error fetching initial lottery data', err);
          setError('Failed to fetch lottery data. Try refreshing the page.');
          clearErrorAfterDelay(8000);
        } finally {
          setLoading(false);
        }
      };
      
      fetchInitialData();
    } else {
      logDebug('No contract available yet, waiting for initialization');
    }
  }, [readContract, contract, fetchLotteryStatus, fetchTicketPrice, clearErrorAfterDelay]);
  
  // Fetch user data when wallet connects
  useEffect(() => {
    if (contract && address && isConnected) {
      logDebug('Wallet connected, fetching user data', { address });
      fetchUserTickets().catch(err => {
        console.error('Error fetching user tickets on wallet connect:', err);
        logDebug('Error fetching user tickets on wallet connect', err);
      });
    }
  }, [contract, address, isConnected, fetchUserTickets]);
  
  // Debug output for major state changes
  useEffect(() => {
    logDebug('Lottery status updated', lotteryStatus);
  }, [lotteryStatus]);
  
  useEffect(() => {
    logDebug('Ticket price updated', ticketPrice);
  }, [ticketPrice]);
  
  useEffect(() => {
    logDebug('User tickets updated', { count: userTicketCount, tickets: userTickets });
  }, [userTickets, userTicketCount]);
  
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