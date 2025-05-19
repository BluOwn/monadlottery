import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext({
  connect: async () => {},
  disconnect: () => {},
  address: null,
  isConnected: false,
  provider: null,
  chainId: null,
  signer: null,
});

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (isConnecting) return null;
    if (typeof window === 'undefined' || !window.ethereum) {
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
      // This helps catch the "unknown account #0" error
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
      
      return accounts[0];
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      // Reset state on error
      setAddress(null);
      setIsConnected(false);
      setProvider(null);
      setChainId(null);
      setSigner(null);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    setSigner(null);
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
      }
    };

    const handleChainChanged = async (chainIdHex) => {
      setChainId(chainIdHex);
      
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
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        address,
        isConnected,
        provider,
        chainId,
        signer,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};