import { create } from 'zustand';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import MonadLotteryABI from '../abis/MonadLottery.json';
import { MONAD_LOTTERY_CONTRACT_ADDRESS } from '../constants/contractAddresses';

// Helper function to safely execute contract calls
const safeContractCall = async (fn, errorMessage) => {
  try {
    return await fn();
  } catch (err) {
    console.error(`${errorMessage}:`, err);
    return null;
  }
};

// Create the lottery store
const useLotteryStore = create((set, get) => ({
  // State
  lotteryStatus: {
    isActive: false,
    totalTickets: 0,
    totalPoolAmount: '0',
    rewardsDistributed: false,
  },
  ticketPrice: '0.01',
  userTickets: [],
  userTicketCount: 0,
  topBuyer: {
    address: null,
    ticketCount: 0,
  },
  loading: false,
  error: null,
  contract: null,

  // Initialize the contract
  initContract: (provider, signer) => {
    if (!provider) return;
    
    try {
      // Create read-only contract with provider
      const contract = new ethers.Contract(
        MONAD_LOTTERY_CONTRACT_ADDRESS,
        MonadLotteryABI,
        provider
      );
      
      // If we have a signer, create a writable contract
      const contractWithSigner = signer 
        ? contract.connect(signer)
        : contract;
      
      set({ contract: contractWithSigner, error: null });
    } catch (err) {
      console.error('Error initializing contract:', err);
      set({ error: 'Failed to initialize contract' });
    }
  },

  // Fetch lottery status
  fetchLotteryStatus: async () => {
    const { contract } = get();
    if (!contract) return;
    
    set({ loading: true });
    
    try {
      const status = await contract.getLotteryStatus();
      if (!status) return;
      
      const lotteryStatus = {
        isActive: status.isActive || false,
        totalTickets: status.tickets ? Number(status.tickets) : 0,
        totalPoolAmount: status.pool ? ethers.utils.formatEther(status.pool) : '0',
        rewardsDistributed: status.awarded || false,
      };
      
      set({ lotteryStatus, error: null });
      
      // Fetch top buyer
      const topBuyerData = await safeContractCall(
        () => contract.getTopBuyer(),
        'Error fetching top buyer'
      );
      
      if (topBuyerData) {
        const [topBuyerAddress, topBuyerTicketCount] = topBuyerData;
        set({
          topBuyer: {
            address: topBuyerAddress || null,
            ticketCount: topBuyerTicketCount ? Number(topBuyerTicketCount) : 0,
          }
        });
      }
      
      return status;
    } catch (err) {
      console.error('Error fetching lottery status:', err);
      set({ error: 'Failed to fetch lottery status' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Fetch ticket price
  fetchTicketPrice: async () => {
    const { contract } = get();
    if (!contract) return;
    
    try {
      const price = await contract.TICKET_PRICE();
      if (price) {
        set({ ticketPrice: ethers.utils.formatEther(price) });
      }
      return price;
    } catch (err) {
      console.error('Error fetching ticket price:', err);
      set({ error: 'Failed to fetch ticket price' });
      return null;
    }
  },

  // Fetch user tickets
  fetchUserTickets: async (address) => {
    const { contract } = get();
    if (!contract || !address) return;
    
    set({ loading: true });
    
    try {
      // Get tickets and ticket count in parallel
      const [ticketsResult, ticketCountResult] = await Promise.all([
        safeContractCall(
          () => contract.getUserTickets(address),
          'Error fetching user tickets'
        ),
        safeContractCall(
          () => contract.getUserTicketCount(address),
          'Error fetching user ticket count'
        )
      ]);
      
      if (ticketsResult) {
        const processedTickets = ticketsResult.map(t => {
          try {
            return t.toNumber();
          } catch (e) {
            return Number(t.toString());
          }
        });
        set({ userTickets: processedTickets });
      } else {
        set({ userTickets: [] });
      }
      
      if (ticketCountResult) {
        try {
          set({ userTicketCount: ticketCountResult.toNumber() });
        } catch (e) {
          set({ userTicketCount: Number(ticketCountResult.toString()) });
        }
      } else {
        set({ userTicketCount: 0 });
      }
      
      set({ error: null });
      return { tickets: ticketsResult, count: ticketCountResult };
    } catch (err) {
      console.error('Error fetching user tickets:', err);
      set({ error: 'Failed to fetch your tickets', userTickets: [], userTicketCount: 0 });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Check balance for purchase
  checkBalanceForPurchase: async (totalCostInMON, signer) => {
    if (!signer) return false;
    
    try {
      const balance = await signer.getBalance();
      const totalCostWei = ethers.utils.parseEther(totalCostInMON);
      
      // Add gas buffer (1% or 0.001 MON, whichever is higher)
      const gasCostEstimate = totalCostWei.mul(1).div(100);
      const minGasCost = ethers.utils.parseEther('0.001');
      const gasCost = gasCostEstimate.gt(minGasCost) ? gasCostEstimate : minGasCost;
      
      const totalRequired = totalCostWei.add(gasCost);
      
      if (balance.lt(totalRequired)) {
        const balanceInMON = ethers.utils.formatEther(balance);
        const requiredInMON = ethers.utils.formatEther(totalRequired);
        set({ 
          error: `Insufficient funds: You have ${parseFloat(balanceInMON).toFixed(4)} MON, but need at least ${parseFloat(requiredInMON).toFixed(4)} MON (including gas).` 
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error checking balance:', err);
      set({ error: 'Could not verify your balance. Please ensure you have enough MON.' });
      return false;
    }
  },

  // Buy tickets
  buyTickets: async (numTickets, signer) => {
    const { contract, ticketPrice, lotteryStatus, fetchLotteryStatus, fetchUserTickets } = get();
    
    if (!contract) {
      set({ error: 'Contract not initialized' });
      toast.error('Contract not initialized');
      return false;
    }
    
    if (!numTickets || numTickets <= 0) {
      set({ error: 'Invalid number of tickets' });
      toast.error('Invalid number of tickets');
      return false;
    }
    
    if (!lotteryStatus.isActive) {
      set({ error: 'Lottery is not active' });
      toast.error('Lottery is not active');
      return false;
    }
    
    set({ loading: true });
    
    try {
      // Calculate total cost
      const ticketPriceFloat = parseFloat(ticketPrice);
      if (isNaN(ticketPriceFloat) || ticketPriceFloat <= 0) {
        throw new Error('Invalid ticket price');
      }
      
      const totalCost = (ticketPriceFloat * numTickets).toFixed(18);
      
      // Check if user has sufficient balance using the signer
      const hasSufficientBalance = await get().checkBalanceForPurchase(totalCost, signer);
      if (!hasSufficientBalance) {
        return false;
      }
      
      const value = ethers.utils.parseEther(totalCost);
      
      // Show pending toast
      const pendingToast = toast.loading(`Buying ${numTickets} ticket${numTickets > 1 ? 's' : ''}...`);
      
      // Estimate gas to catch potential errors
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.buyTickets(numTickets, { value });
        // Add 20% buffer to gas estimate
        gasEstimate = gasEstimate.mul(120).div(100);
      } catch (gasError) {
        toast.dismiss(pendingToast);
        console.error('Gas estimation error:', gasError);
        
        const reason = gasError.message.includes('reason:') 
          ? gasError.message.split('reason:')[1].trim() 
          : 'Transaction would fail';
        throw new Error(`Transaction would fail: ${reason}`);
      }
      
      // Send transaction with gas estimate
      const tx = await contract.buyTickets(numTickets, { 
        value,
        gasLimit: gasEstimate
      });
      
      // Update toast with transaction hash
      toast.loading(
        `Transaction submitted. Waiting for confirmation...\nHash: ${tx.hash.substring(0, 10)}...`,
        { id: pendingToast }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        toast.dismiss(pendingToast);
        return false;
      }
      
      // Success toast
      toast.success(`Successfully purchased ${numTickets} ticket${numTickets > 1 ? 's' : ''}!`, { id: pendingToast });
      
      // Refresh data after purchase
      try {
        await fetchLotteryStatus();
      } catch (e) {
        console.error('Error refreshing lottery status after purchase:', e);
      }
      
      try {
        const userAddress = await signer.getAddress();
        await fetchUserTickets(userAddress);
      } catch (e) {
        console.error('Error refreshing user tickets after purchase:', e);
      }
      
      set({ error: null });
      return true;
    } catch (err) {
      console.error('Error buying tickets:', err);
      
      // Handle various error types
      let errorMessage = 'Transaction failed';
      
      if (typeof err === 'object' && err !== null) {
        if (err.message) {
          if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds. Please make sure you have enough MON tokens.';
          } else if (err.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else {
            errorMessage = err.message.includes(':') 
              ? err.message.split(':')[1].trim() 
              : err.message;
            
            if (errorMessage.length > 100) {
              errorMessage = errorMessage.substring(0, 100) + '...';
            }
          }
        }
      }
      
      toast.error(`Failed to buy tickets: ${errorMessage}`);
      set({ error: `Failed to buy tickets: ${errorMessage}` });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useLotteryStore;