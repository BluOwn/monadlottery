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
  const [ticketPrice, setTicketPrice] = useState('0');
  const [userTickets, setUserTickets] = useState([]);
  const [userTicketCount, setUserTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topBuyer, setTopBuyer] = useState({
    address: null,
    ticketCount: 0,
  });
  
  // Setup contract instance
  useEffect(() => {
    let isActive = true;
    
    const initContract = async () => {
      if (!provider) {
        if (isActive) setLoading(false);
        return;
      }
      
      try {
        const contractRead = new ethers.Contract(
          MONAD_LOTTERY_CONTRACT_ADDRESS,
          MonadLotteryABI,
          provider
        );
        
        if (isActive) {
          setContract(contractRead);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error setting up contract:', err);
        if (isActive) {
          setError('Failed to setup contract instance');
          setLoading(false);
        }
      }
    };
    
    initContract();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isActive = false;
    };
  }, [provider]);
  
  // Setup contract instance with signer when connected
  useEffect(() => {
    if (!signer || !contract) return;
    
    try {
      const contractWrite = new ethers.Contract(
        MONAD_LOTTERY_CONTRACT_ADDRESS,
        MonadLotteryABI,
        signer
      );
      setContract(contractWrite);
      setError(null);
    } catch (err) {
      console.error('Error setting up contract with signer:', err);
      setError('Failed to setup contract with signer');
    }
  }, [signer, contract]);
  
  // Fetch lottery status
  const fetchLotteryStatus = useCallback(async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      
      const status = await contract.getLotteryStatus();
      if (!status) throw new Error('Failed to get lottery status');
      
      setLotteryStatus({
        isActive: status.isActive,
        totalTickets: status.tickets ? status.tickets.toNumber() : 0,
        totalPoolAmount: status.pool ? ethers.utils.formatEther(status.pool) : '0',
        rewardsDistributed: status.awarded,
      });
      
      // Safely get top buyer data
      try {
        const [topBuyerAddress, topBuyerTicketCount] = await contract.getTopBuyer();
        setTopBuyer({
          address: topBuyerAddress,
          ticketCount: topBuyerTicketCount ? topBuyerTicketCount.toNumber() : 0,
        });
      } catch (topBuyerErr) {
        console.error('Error fetching top buyer:', topBuyerErr);
        // Don't set error since this is secondary data
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching lottery status:', err);
      setError('Failed to fetch lottery status');
    } finally {
      setLoading(false);
    }
  }, [contract]);
  
  // Fetch ticket price
  const fetchTicketPrice = useCallback(async () => {
    if (!contract) return;
    
    try {
      const price = await contract.TICKET_PRICE();
      if (price) {
        setTicketPrice(ethers.utils.formatEther(price));
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching ticket price:', err);
      setError('Failed to fetch ticket price');
    }
  }, [contract]);
  
  // Fetch user tickets
  const fetchUserTickets = useCallback(async () => {
    if (!contract || !address) return;
    
    try {
      setLoading(true);
      
      // Use Promise.all to fetch both in parallel
      const [tickets, ticketCount] = await Promise.all([
        contract.getUserTickets(address),
        contract.getUserTicketCount(address)
      ]);
      
      setUserTickets(tickets ? tickets.map(t => t.toNumber()) : []);
      setUserTicketCount(ticketCount ? ticketCount.toNumber() : 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching user tickets:', err);
      setError('Failed to fetch your tickets');
      // Reset to empty state on error
      setUserTickets([]);
      setUserTicketCount(0);
    } finally {
      setLoading(false);
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
    
    try {
      setLoading(true);
      const value = ethers.utils.parseEther(
        (parseFloat(ticketPrice) * numTickets).toString()
      );
      
      const tx = await contract.buyTickets(numTickets, { value });
      await tx.wait();
      
      // Refresh data after purchase
      await Promise.all([
        fetchLotteryStatus(),
        fetchUserTickets()
      ]);
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error buying tickets:', err);
      const errorMessage = err.message || 'Transaction failed';
      setError(`Failed to buy tickets: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, isConnected, ticketPrice, fetchLotteryStatus, fetchUserTickets]);
  
  // Initial data fetching
  useEffect(() => {
    if (contract) {
      // Create an async function to fetch initial data
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            fetchLotteryStatus(),
            fetchTicketPrice()
          ]);
        } catch (err) {
          console.error('Error fetching initial data:', err);
          setError('Failed to load lottery data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchInitialData();
    }
  }, [contract, fetchLotteryStatus, fetchTicketPrice]);
  
  // Fetch user's tickets when connected
  useEffect(() => {
    if (contract && address) {
      fetchUserTickets();
    } else {
      setUserTickets([]);
      setUserTicketCount(0);
    }
  }, [contract, address, fetchUserTickets]);
  
  return {
    lotteryStatus,
    ticketPrice,
    userTickets,
    userTicketCount,
    loading,
    error,
    topBuyer,
    buyTickets,
    refreshStatus: fetchLotteryStatus,
    refreshUserTickets: fetchUserTickets,
  };
};