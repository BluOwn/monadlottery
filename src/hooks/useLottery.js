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
    if (provider) {
      try {
        const contractRead = new ethers.Contract(
          MONAD_LOTTERY_CONTRACT_ADDRESS,
          MonadLotteryABI,
          provider
        );
        setContract(contractRead);
        setLoading(false);
      } catch (err) {
        console.error('Error setting up contract:', err);
        setError('Failed to setup contract instance');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [provider]);
  
  // Setup contract instance with signer when connected
  useEffect(() => {
    if (signer && contract) {
      try {
        const contractWrite = new ethers.Contract(
          MONAD_LOTTERY_CONTRACT_ADDRESS,
          MonadLotteryABI,
          signer
        );
        setContract(contractWrite);
      } catch (err) {
        console.error('Error setting up contract with signer:', err);
        setError('Failed to setup contract with signer');
      }
    }
  }, [signer, contract]);
  
  // Fetch lottery status
  const fetchLotteryStatus = useCallback(async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const status = await contract.getLotteryStatus();
      setLotteryStatus({
        isActive: status.isActive,
        totalTickets: status.tickets.toNumber(),
        totalPoolAmount: ethers.utils.formatEther(status.pool),
        rewardsDistributed: status.awarded,
      });
      
      const [topBuyerAddress, topBuyerTicketCount] = await contract.getTopBuyer();
      setTopBuyer({
        address: topBuyerAddress,
        ticketCount: topBuyerTicketCount.toNumber(),
      });
      
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
      setTicketPrice(ethers.utils.formatEther(price));
      setError(null);
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
      const tickets = await contract.getUserTickets(address);
      const ticketCount = await contract.getUserTicketCount(address);
      
      setUserTickets(tickets.map(t => t.toNumber()));
      setUserTicketCount(ticketCount.toNumber());
      setError(null);
    } catch (err) {
      console.error('Error fetching user tickets:', err);
      setError('Failed to fetch your tickets');
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
    
    try {
      setLoading(true);
      const value = ethers.utils.parseEther(
        (parseFloat(ticketPrice) * numTickets).toString()
      );
      
      const tx = await contract.buyTickets(numTickets, { value });
      await tx.wait();
      
      await fetchLotteryStatus();
      await fetchUserTickets();
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error buying tickets:', err);
      setError(`Failed to buy tickets: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, isConnected, ticketPrice, fetchLotteryStatus, fetchUserTickets]);
  
  // Initial data fetching
  useEffect(() => {
    if (contract) {
      fetchLotteryStatus();
      fetchTicketPrice();
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