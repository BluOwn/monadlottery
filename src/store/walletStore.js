import { create } from 'zustand';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_CONFIG } from '../constants/contractAddresses';

// Helper for normalizing chain IDs
const normalizeChainId = (id) => {
  if (typeof id === 'string') {
    return id.startsWith('0x') ? parseInt(id, 16).toString() : id;
  }
  return id.toString();
};

// Create wallet store
const useWalletStore = create((set, get) => ({
  address: null,
  isConnected: false,
  provider: null,
  signer: null,
  chainId: null,
  isConnecting: false,
  isCorrectNetwork: false,
  error: null,

  // Initialize wallet from local storage or session
  initWallet: async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Verify signer is valid
        try {
          await web3Signer.getAddress();
          set({
            address: accounts[0],
            isConnected: true,
            provider: web3Provider,
            signer: web3Signer,
            chainId: chainIdHex,
          });
          
          // Check network
          const normalizedChainId = normalizeChainId(chainIdHex);
          const normalizedTargetChainId = normalizeChainId(MONAD_TESTNET_CHAIN_ID);
          set({ isCorrectNetwork: normalizedChainId === normalizedTargetChainId });
        } catch (err) {
          console.error('Invalid signer during initial check:', err);
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  },

  // Connect wallet
  connect: async () => {
    if (get().isConnecting) return null;
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('No Ethereum wallet found');
      return null;
    }
    
    set({ isConnecting: true, error: null });
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      
      // Get chain ID
      const chainIdHex = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });

      // Verify we have a valid signer
      try {
        const signerAddress = await web3Signer.getAddress();
        if (!signerAddress) throw new Error('Could not get signer address');
      } catch (signerError) {
        console.error('Signer error:', signerError);
        throw new Error('Wallet connection failed: Could not access account');
      }
      
      // Update state
      set({
        address: accounts[0],
        isConnected: true,
        provider: web3Provider,
        signer: web3Signer,
        chainId: chainIdHex,
      });
      
      // Check network
      const normalizedChainId = normalizeChainId(chainIdHex);
      const normalizedTargetChainId = normalizeChainId(MONAD_TESTNET_CHAIN_ID);
      const isCorrect = normalizedChainId === normalizedTargetChainId;
      set({ isCorrectNetwork: isCorrect });
      
      // If not on correct network, try to switch
      if (!isCorrect) {
        setTimeout(() => get().switchNetwork(), 500);
      }
      
      return accounts[0];
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      // Reset state on error
      set({
        address: null,
        isConnected: false,
        provider: null,
        chainId: null,
        signer: null,
        error: error.message
      });
      
      // Show user-friendly error message
      if (error.message.includes('User rejected')) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
      
      throw error;
    } finally {
      set({ isConnecting: false });
    }
  },

  // Disconnect wallet
  disconnect: () => {
    set({
      address: null,
      isConnected: false,
      provider: null,
      chainId: null,
      signer: null,
      isCorrectNetwork: false,
      error: null
    });
    
    toast.success('Wallet disconnected');
  },

  // Switch to Monad testnet
  switchNetwork: async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('No Ethereum wallet found');
      return false;
    }
    
    set({ isConnecting: true });
    
    try {
      // Format chainId as hex with 0x prefix
      const chainIdHex = `0x${parseInt(MONAD_TESTNET_CHAIN_ID).toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      toast.success('Switched to Monad Testnet');
      set({ isCorrectNetwork: true });
      return true;
    } catch (switchError) {
      console.error('Error switching network:', switchError);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${parseInt(MONAD_TESTNET_CHAIN_ID).toString(16)}`,
                chainName: MONAD_TESTNET_CONFIG.name,
                nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
                rpcUrls: MONAD_TESTNET_CONFIG.rpcUrls.default.http,
                blockExplorerUrls: [MONAD_TESTNET_CONFIG.blockExplorers.default.url],
              },
            ],
          });
          
          toast.success('Monad Testnet added to your wallet');
          set({ isCorrectNetwork: true });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Could not add Monad Testnet to your wallet');
        }
      } else {
        toast.error('Failed to switch network. Please try manually switching to Monad Testnet in your wallet.');
      }
      return false;
    } finally {
      set({ isConnecting: false });
    }
  },

  // Update on account or chain changes
  setupEventListeners: () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        set({ address: accounts[0], isConnected: true });
      } else {
        get().disconnect();
      }
    };

    const handleChainChanged = async (chainIdHex) => {
      set({ chainId: chainIdHex });
      
      // Check network
      const normalizedChainId = normalizeChainId(chainIdHex);
      const normalizedTargetChainId = normalizeChainId(MONAD_TESTNET_CHAIN_ID);
      set({ isCorrectNetwork: normalizedChainId === normalizedTargetChainId });
      
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const web3Signer = web3Provider.getSigner();
          
          try {
            await web3Signer.getAddress();
            set({ provider: web3Provider, signer: web3Signer });
          } catch (err) {
            console.error('Invalid signer after chain change:', err);
            get().disconnect();
          }
        } catch (err) {
          console.error('Error updating provider after chain change:', err);
          get().disconnect();
        }
      }
    };

    // Set up event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', get().disconnect);

    // Return cleanup function
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', get().disconnect);
      }
    };
  },
}));

export default useWalletStore;