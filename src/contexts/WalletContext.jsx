import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_CONFIG } from '../constants/contractAddresses';
import toast from 'react-hot-toast';

export const WalletContext = createContext({
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  address: null,
  isConnected: false,
  provider: null,
  chainId: null,
  signer: null,
  isConnecting: false,
  isCorrectNetwork: false,
});

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check if connected to correct network
  const checkNetwork = useCallback((currentChainId) => {
    if (!currentChainId) return false;
    
    // Normalize chain IDs for comparison
    const normalizeChainId = (id) => {
      if (typeof id === 'string') {
        return id.startsWith('0x') ? parseInt(id, 16).toString() : id;
      }
      return id.toString();
    };
    
    const normalizedCurrentChainId = normalizeChainId(currentChainId);
    const normalizedTargetChainId = normalizeChainId(MONAD_TESTNET_CHAIN_ID);
    
    const isCorrect = normalizedCurrentChainId === normalizedTargetChainId;
    setIsCorrectNetwork(isCorrect);
    return isCorrect;
  }, []);

  // Switch to Monad Testnet
  const switchNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('No Ethereum wallet found');
      return false;
    }
    
    try {
      setIsConnecting(true);
      
      // Format chainId as hex with 0x prefix
      const chainIdHex = `0x${parseInt(MONAD_TESTNET_CHAIN_ID).toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      toast.success('Switched to Monad Testnet');
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
      setIsConnecting(false);
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting) return null;
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('No Ethereum wallet found');
      throw new Error('No Ethereum wallet found');
    }
    
    setIsConnecting(true);
    
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

      // Verify we have a valid signer by trying to get its address
      try {
        const signerAddress = await web3Signer.getAddress();
        if (!signerAddress) throw new Error('Could not get signer address');
      } catch (signerError) {
        console.error('Signer error:', signerError);
        throw new Error('Wallet connection failed: Could not access account');
      }
      
      setAddress(accounts[0]);
      setIsConnected(true);
      setProvider(web3Provider);
      setChainId(chainIdHex);
      setSigner(web3Signer);
      
      // Check if we're on the correct network
      const isCorrect = checkNetwork(chainIdHex);
      
      // If not on the correct network, try to switch
      if (!isCorrect) {
        // We don't await this to allow the connection to complete first
        // Then we'll attempt to switch networks
        setTimeout(async () => {
          try {
            await switchNetwork();
          } catch (switchError) {
            console.error('Network switch after connect failed:', switchError);
          }
        }, 500);
      }
      
      return accounts[0];
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      // Reset state on error
      setAddress(null);
      setIsConnected(false);
      setProvider(null);
      setChainId(null);
      setSigner(null);
      
      // Show user-friendly error message
      if (error.message.includes('User rejected')) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
      
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, checkNetwork, switchNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    setSigner(null);
    setIsCorrectNetwork(false);
  }, []);

  // Setup listeners for wallet events
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      } else {
        disconnect();
        toast.info('Wallet disconnected');
      }
    };

    const handleChainChanged = async (chainIdHex) => {
      // When chain changes, page will reload in most wallets
      // But we'll handle it gracefully just in case
      setChainId(chainIdHex);
      checkNetwork(chainIdHex);
      
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const web3Signer = web3Provider.getSigner();
          
          // Verify the signer is valid
          try {
            await web3Signer.getAddress();
            setProvider(web3Provider);
            setSigner(web3Signer);
          } catch (err) {
            console.error('Invalid signer after chain change:', err);
            disconnect();
          }
        } catch (err) {
          console.error('Error updating provider after chain change:', err);
          disconnect();
        }
      }
    };

    const handleDisconnect = () => {
      disconnect();
      toast.info('Wallet disconnected');
    };

    // Initial connection check
    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const web3Signer = web3Provider.getSigner();
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          
          // Verify signer is valid
          try {
            await web3Signer.getAddress();
            setAddress(accounts[0]);
            setIsConnected(true);
            setProvider(web3Provider);
            setSigner(web3Signer);
            setChainId(chainIdHex);
            checkNetwork(chainIdHex);
          } catch (err) {
            console.error('Invalid signer during initial check:', err);
            // Don't set connected state if signer is invalid
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();

    // Set up event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Cleanup
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [disconnect, checkNetwork]);

  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        switchNetwork,
        address,
        isConnected,
        provider,
        chainId,
        signer,
        isConnecting,
        isCorrectNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};