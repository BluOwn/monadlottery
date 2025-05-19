import { useContext, useEffect, useState, useCallback } from 'react';
import { WalletContext } from '../contexts/WalletContext';

/**
 * Custom hook to access wallet context and provide additional functionality
 * This hook wraps the WalletContext and provides error handling and 
 * safeguards to prevent React Error #130 and MetaMask connection issues
 */
export const useWallet = () => {
  const context = useContext(WalletContext);
  
  // If the context is undefined, something is wrong with the provider setup
  if (!context) {
    console.error('useWallet must be used within a WalletProvider');
    // Return fallback values to prevent undefined errors
    return {
      connect: async () => {
        console.error('WalletContext is not available');
        return null;
      },
      disconnect: () => {
        console.error('WalletContext is not available');
      },
      address: null,
      isConnected: false,
      provider: null,
      chainId: null,
      signer: null,
      error: 'Wallet context not available',
    };
  }
  
  // Create a wrapped connect function to prevent multiple simultaneous requests
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  const safeConnect = useCallback(async () => {
    // Prevent multiple connection attempts
    if (isConnecting) {
      console.log('Connection already in progress, ignoring duplicate request');
      return null;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && !window.ethereum) {
        throw new Error('No Ethereum wallet found. Please install MetaMask.');
      }
      
      const address = await context.connect();
      return address;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, context]);
  
  // Create a wrapped disconnect function
  const safeDisconnect = useCallback(() => {
    try {
      context.disconnect();
      setError(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  }, [context]);
  
  // Add an effect to detect provider state if it's undefined initially
  useEffect(() => {
    // Check if the provider is null but we're still marked as connected
    if (!context.provider && context.isConnected) {
      console.warn('Provider is null but wallet is marked as connected. Fixing inconsistent state.');
      context.disconnect(); // Reset to a consistent state
    }
  }, [context]);
  
  return {
    ...context,
    connect: safeConnect,
    disconnect: safeDisconnect,
    isConnecting,
    walletError: error,
  };
};

export default useWallet;