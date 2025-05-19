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
  const [isConnecting, setIsConnecting] = useState(false); // Add this to prevent multiple connection attempts

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) return null;
    
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setIsConnecting(true);
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned from wallet');
        }
        
        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
        const newSigner = newProvider.getSigner();
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        
        setAddress(accounts[0]);
        setIsConnected(true);
        setProvider(newProvider);
        setChainId(chainIdHex);
        setSigner(newSigner);
        
        return accounts[0];
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
        throw error;
      } finally {
        setIsConnecting(false);
      }
    } else {
      console.error('Please install MetaMask!');
      throw new Error('No ethereum wallet found');
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    setSigner(null);
  }, []);

  // Setup listeners
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

    const handleChainChanged = (chainIdHex) => {
      setChainId(chainIdHex);
      // Refresh provider and signer on chain change
      if (window.ethereum) {
        try {
          const newProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(newProvider);
          setSigner(newProvider.getSigner());
        } catch (err) {
          console.error('Error updating provider after chain change:', err);
        }
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    // Check if already connected (only on initial mount)
    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        handleAccountsChanged(accounts);
        
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        handleChainChanged(chainIdHex);
      } catch (err) {
        console.error('Error checking existing connection:', err);
      }
    };
    
    checkConnection();

    // Add listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Remove listeners on cleanup
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};