import { useEffect } from 'react';
import useWalletStore from '../store/walletStore';
import useLotteryStore from '../store/lotteryStore';

export const useWallet = () => {
  const {
    address,
    isConnected,
    provider,
    signer,
    chainId,
    isConnecting,
    isCorrectNetwork,
    error,
    connect,
    disconnect,
    switchNetwork,
    initWallet,
    setupEventListeners
  } = useWalletStore();
  
  // Initialize wallet on component mount
  useEffect(() => {
    initWallet();
    
    // Set up event listeners for wallet changes
    const cleanup = setupEventListeners();
    
    // Clean up event listeners on unmount
    return cleanup;
  }, [initWallet, setupEventListeners]);
  
  return {
    address,
    isConnected,
    provider,
    signer,
    chainId,
    isConnecting,
    isCorrectNetwork,
    walletError: error,
    connect,
    disconnect,
    switchNetwork
  };
};

export default useWallet;