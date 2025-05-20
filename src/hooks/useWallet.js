import { useEffect } from 'react';
import useWalletStore from '../store/walletStore';

export const useWallet = () => {
  const {
    address,
    isConnected,
    provider,
    readProvider,
    signer,
    chainId,
    isConnecting,
    isCorrectNetwork,
    error,
    connect,
    disconnect,
    switchNetwork,
    initWallet,
    initReadProvider,
    refreshReadProvider,
    getBestProvider,
    setupEventListeners
  } = useWalletStore();
  
  // Initialize wallet and read provider on component mount
  useEffect(() => {
    // Initialize read provider first
    initReadProvider().catch(err => {
      console.error('Failed to initialize read provider:', err);
    });
    
    // Then initialize wallet
    initWallet();
    
    // Set up event listeners for wallet changes
    const cleanup = setupEventListeners();
    
    // Clean up event listeners on unmount
    return cleanup;
  }, [initReadProvider, initWallet, setupEventListeners]);
  
  return {
    address,
    isConnected,
    provider,
    readProvider,   // Expose the read provider
    signer,
    chainId,
    isConnecting,
    isCorrectNetwork,
    walletError: error,
    connect,
    disconnect,
    switchNetwork,
    getBestProvider, // Expose helper to get best available provider
    refreshReadProvider // Expose method to refresh read provider if needed
  };
};

export default useWallet;