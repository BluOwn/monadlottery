import { useState, useEffect } from 'react';
import { FiWifi, FiUser, FiAlertTriangle } from 'react-icons/fi';
import { useWallet } from '../../hooks/useWallet';
import { MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_CONFIG } from '../../constants/contractAddresses';
import toast from 'react-hot-toast';

const ConnectWallet = ({ compact = false }) => {
  const { connect, disconnect, address, isConnected, chainId } = useWallet();
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  useEffect(() => {
    if (!chainId) {
      setIsCorrectChain(false);
      return;
    }
    
    // Normalize chain IDs before comparison to handle different formats
    const normalizeChainId = (id) => {
      if (typeof id === 'string') {
        // Remove '0x' prefix if present and convert to number
        return id.startsWith('0x') ? parseInt(id, 16).toString() : id;
      }
      return id.toString();
    };
    
    // Compare the normalized chain IDs
    const normalizedChainId = normalizeChainId(chainId);
    const normalizedTargetChainId = normalizeChainId(MONAD_TESTNET_CHAIN_ID);
    const isCorrect = normalizedChainId === normalizedTargetChainId;
    
    setIsCorrectChain(isCorrect);
    
    // Show toast notification when switching to a wrong network
    if (isConnected && !isCorrect) {
      toast.error('Please switch to Monad Testnet to use this application');
    }
  }, [chainId, isConnected]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    // Prevent multiple connection attempts
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const switchToMonadTestnet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('No Ethereum wallet detected');
      return;
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
    } catch (switchError) {
      console.error('Switch error:', switchError);
      
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
        } catch (addError) {
          console.error('Error adding Monad testnet:', addError);
          toast.error('Could not add Monad Testnet to your wallet');
        }
      } else {
        toast.error('Failed to switch network. Please try manually switching to Monad Testnet in your wallet.');
      }
    } finally {
      setIsConnecting(false);
      setShowNetworkMenu(false);
    }
  };

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className={`${
          compact
            ? 'px-2 py-2 text-primary-600 dark:text-primary-500'
            : 'btn-primary'
        }`}
        disabled={isConnecting}
        aria-label="Connect wallet"
      >
        {isConnecting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {!compact && <span>Connecting...</span>}
          </span>
        ) : (
          <>
            <FiWifi className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
            {!compact && <span>Connect Wallet</span>}
          </>
        )}
      </button>
    );
  }

  // If connected but on wrong network, show switch network button and menu
  if (!isCorrectChain) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowNetworkMenu(!showNetworkMenu)}
          className={`${
            compact
              ? 'px-2 py-2 rounded-full'
              : 'btn'
          } bg-red-600 hover:bg-red-700 text-white transition-colors duration-300`}
          aria-label="Switch network"
        >
          <FiAlertTriangle className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
          {!compact && <span>Wrong Network</span>}
        </button>
        
        {showNetworkMenu && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <div className="px-4 py-2 text-sm text-dark-500 dark:text-dark-400">
                Please switch to Monad Testnet
              </div>
              
              <button
                onClick={switchToMonadTestnet}
                className="block w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700"
                role="menuitem"
              >
                Switch to Monad Testnet
              </button>
              
              <button
                onClick={handleDisconnect}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-dark-100 dark:hover:bg-dark-700"
                role="menuitem"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Connected and on correct network
  return (
    <div className="relative">
      <button
        onClick={() => setShowNetworkMenu(!showNetworkMenu)}
        className={`${
          compact
            ? 'px-2 py-2 rounded-full'
            : 'btn'
        } bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-300`}
        aria-label={compact ? "Account menu" : "Account: " + formatAddress(address)}
      >
        <FiUser className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
        {!compact && <span>{formatAddress(address)}</span>}
      </button>
      
      {showNetworkMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-sm font-medium text-dark-900 dark:text-white">
              Connected to Monad Testnet
            </div>
            
            <div className="px-4 py-2 text-xs font-mono text-dark-500 dark:text-dark-400 break-all">
              {address}
            </div>
            
            <button
              onClick={handleDisconnect}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-dark-100 dark:hover:bg-dark-700"
              role="menuitem"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;