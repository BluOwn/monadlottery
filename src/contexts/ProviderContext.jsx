import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';

// Create context
const ProviderContext = createContext({
  isInitialized: false,
  hasReadProvider: false,
  hasWalletProvider: false,
  isLoading: true,
});

// Provider component
export const ProviderContextProvider = ({ children }) => {
  const { readProvider, provider, isConnected } = useWallet();
  const [state, setState] = useState({
    isInitialized: false,
    hasReadProvider: false,
    hasWalletProvider: false,
    isLoading: true,
  });

  // Update state when providers change
  useEffect(() => {
    const hasReadProvider = !!readProvider;
    const hasWalletProvider = !!provider && isConnected;
    
    setState({
      isInitialized: hasReadProvider || hasWalletProvider,
      hasReadProvider,
      hasWalletProvider,
      isLoading: !(hasReadProvider || hasWalletProvider),
    });
  }, [readProvider, provider, isConnected]);

  return (
    <ProviderContext.Provider value={state}>
      {children}
    </ProviderContext.Provider>
  );
};

// Hook to use the context
export const useProviderContext = () => useContext(ProviderContext);

export default ProviderContextProvider;