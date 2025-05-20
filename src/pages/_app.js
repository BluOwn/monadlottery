import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import useWalletStore from '../store/walletStore';
import { ProviderContextProvider } from '../contexts/ProviderContext';
import toast from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  const { initWallet, setupEventListeners, initReadProvider } = useWalletStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize providers on app load
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      
      try {
        // First initialize the read provider
        console.log('[APP] Initializing read provider');
        const readProvider = await initReadProvider();
        console.log('[APP] Read provider initialized:', !!readProvider);
        
        // Then initialize wallet
        console.log('[APP] Initializing wallet');
        await initWallet();
        console.log('[APP] Wallet initialized');
        
        // Setup event listeners
        console.log('[APP] Setting up event listeners');
        const cleanup = setupEventListeners();
        
        // Successful initialization
        console.log('[APP] Application initialized successfully');
      } catch (err) {
        console.error('[APP] Error during initialization:', err);
        toast.error('Failed to initialize application. Some features may not work correctly.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    init();
    
    // Return cleanup function from setupEventListeners
    return () => {
      // The actual cleanup function is returned by setupEventListeners
      // but we can't access it directly here, so we're just providing a note
      console.log('[APP] Cleanup - component unmounting');
    };
  }, [initReadProvider, initWallet, setupEventListeners]);

  return (
    <ProviderContextProvider>
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
      {isInitializing ? (
        <div className="fixed inset-0 flex items-center justify-center bg-dark-900 bg-opacity-75 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-white">Initializing application...</p>
          </div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
    </ProviderContextProvider>
  );
}

export default MyApp;