import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useWalletStore from '../store/walletStore';

function MyApp({ Component, pageProps }) {
  const { initWallet, setupEventListeners } = useWalletStore();

  // Initialize wallet on app load
  useEffect(() => {
    initWallet();
    const cleanup = setupEventListeners();
    
    return cleanup;
  }, [initWallet, setupEventListeners]);

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;