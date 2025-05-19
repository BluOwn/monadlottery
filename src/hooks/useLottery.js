import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import MonadLotteryABI from '../abis/MonadLottery.json';
import { MONAD_LOTTERY_CONTRACT_ADDRESS } from '../constants/contractAddresses';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(false); // Start with false to avoid UI flicker
  const [initialLoading, setInitialLoading] = useState(true); // Use separate state for initial loading
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
        clearErrorAfterDelay();
      }
      return null;
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [contract, clearErrorAfterDelay]);
  
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
        clearErrorAfterDelay();
      }
      return null;
    }
  }, [contract, clearErrorAfterDelay]);
  
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
        clearErrorAfterDelay();
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
  }, [contract, address, clearErrorAfterDelay]);
  
  // Check balance before buying tickets
  const checkBalanceForPurchase = useCallback(async (totalCostInMON) => {
    if (!signer) return false;
    
    try {
      const balance = await signer.getBalance();
      const totalCostWei = ethers.utils.parseEther(totalCostInMON);
      
      // Add a buffer for gas (1% of transaction cost or 0.001 MON, whichever is higher)
      const gasCostEstimate = totalCostWei.mul(1).div(100); // 1% buffer
      const minGasCost = ethers.utils.parseEther('0.001'); // Minimum 0.001 MON
      const gasCost = gasCostEstimate.gt(minGasCost) ? gasCostEstimate : minGasCost;
      
      const totalRequired = totalCostWei.add(gasCost);
      
      if (balance.lt(totalRequired)) {
        const balanceInMON = ethers.utils.formatEther(balance);
        const requiredInMON = ethers.utils.formatEther(totalRequired);
        setError(`Insufficient funds: You have ${parseFloat(balanceInMON).toFixed(4)} MON, but need at least ${parseFloat(requiredInMON).toFixed(4)} MON (including gas).`);
        clearErrorAfterDelay(8000);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error checking balance:', err);
      setError('Could not verify your balance. Please ensure you have enough MON.');
      clearErrorAfterDelay();
      return false;
    }
  }, [signer, clearErrorAfterDelay]);
  
  // Buy tickets
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
      
      // Check if user has sufficient balance
      const hasSufficientBalance = await checkBalanceForPurchase(totalCost);
      if (!hasSufficientBalance) {
        return false;
      }
      
      const value = ethers.utils.parseEther(totalCost);
      
      // Check if we have a valid value
      if (!value || value.isZero()) {
        throw new Error('Invalid transaction value');
      }
      
      // Show pending toast
      const pendingToast = toast.loading(`Buying ${numTickets} ticket${numTickets > 1 ? 's' : ''}...`);
      
      // Estimate gas to catch potential errors before sending transaction
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.buyTickets(numTickets, { value });
        // Add 20% buffer to gas estimate
        gasEstimate = gasEstimate.mul(120).div(100);
      } catch (gasError) {
        toast.dismiss(pendingToast);
        console.error('Gas estimation error:', gasError);
        
        // Check for specific error messages
        if (gasError.message.includes('execution reverted')) {
          const reason = gasError.message.includes('reason:') 
            ? gasError.message.split('reason:')[1].trim() 
            : 'Transaction would fail';
          throw new Error(`Transaction would fail: ${reason}`);
        }
        
        throw new Error('Failed to estimate gas. Transaction may fail.');
      }
      
      // Send transaction with gas estimate
      const tx = await contract.buyTickets(numTickets, { 
        value,
        gasLimit: gasEstimate
      });
      
      // Update toast to show transaction hash
      toast.loading(
        `Transaction submitted. Waiting for confirmation...\nHash: ${tx.hash.substring(0, 10)}...`,
        { id: pendingToast }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (!receipt || !isMounted) {
        toast.dismiss(pendingToast);
        return false;
      }
      
      // Success toast
      toast.success(`Successfully purchased ${numTickets} ticket${numTickets > 1 ? 's' : ''}!`, { id: pendingToast });
      
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
      
      // Handle various error types
      let errorMessage = 'Transaction failed';
      
      if (typeof err === 'object' && err !== null) {
        // Check for common error patterns
        if (err.message) {
          if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds. Please make sure you have enough MON tokens.';
          } else if (err.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (err.message.includes('gas required exceeds')) {
            errorMessage = 'The transaction would require too much gas. Try buying fewer tickets.';
          } else if (err.message.includes('execution reverted')) {
            // Extract the revert reason if available
            const reasonMatch = err.message.match(/reason="([^"]+)"/);
            if (reasonMatch && reasonMatch[1]) {
              errorMessage = `Smart contract error: ${reasonMatch[1]}`;
            } else {
              errorMessage = 'Transaction reverted by the smart contract';
            }
          } else {
            // Extract a more user-friendly message from ethers error if available
            errorMessage = err.message.includes(':') 
              ? err.message.split(':')[1].trim() 
              : err.message;
            
            // Limit the length of the error message
            if (errorMessage.length > 100) {
              errorMessage = errorMessage.substring(0, 100) + '...';
            }
          }
        }
        
        // Check for error code
        if (err.code) {
          if (err.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = 'Insufficient funds. Please make sure you have enough MON tokens.';
          } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
            errorMessage = 'Could not estimate gas. The transaction might fail.';
          }
        }
      }
      
      // Show error toast
      toast.error(`Failed to buy tickets: ${errorMessage}`);
      
      if (isMounted) {
        setError(`Failed to buy tickets: ${errorMessage}`);
        clearErrorAfterDelay(8000);
      }
      return false;
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [
    contract, 
    isConnected, 
    isCorrectNetwork,
    ticketPrice, 
    lotteryStatus, 
    fetchLotteryStatus, 
    fetchUserTickets, 
    checkBalanceForPurchase,
    clearErrorAfterDelay
  ]);
  
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
          clearErrorAfterDelay();
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
  }, [contract, fetchLotteryStatus, fetchTicketPrice, clearErrorAfterDelay]);
  
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
  
  // Set up a periodic refresh of lottery status
  useEffect(() => {
    if (!contract) return;
    
    // Refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchLotteryStatus().catch(err => {
        console.error('Error in auto-refresh:', err);
      });
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [contract, fetchLotteryStatus]);
  
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