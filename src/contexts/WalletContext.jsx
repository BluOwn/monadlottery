import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
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

  const connect = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        
        setAddress(accounts[0]);
        setIsConnected(true);
        setProvider(provider);
        setChainId(chainIdHex);
        setSigner(signer);
        
        return accounts[0];
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
        throw error;
      }
    } else {
      console.error('Please install MetaMask!');
      throw new Error('No ethereum wallet found');
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    setSigner(null);
  }, []);

  // Setup listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
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
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          setSigner(provider.getSigner());
        }
      };

      const handleDisconnect = () => {
        disconnect();
      };

      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err) => console.error(err));

      // Get initial chain
      window.ethereum
        .request({ method: 'eth_chainId' })
        .then(handleChainChanged)
        .catch((err) => console.error(err));

      // Add listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      // Remove listeners on cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
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

export const useWallet = () => useContext(WalletContext);