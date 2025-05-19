import { useState, useEffect } from 'react';
import { FiWifi, FiUser, FiAlertTriangle } from 'react-icons/fi';
import { useWallet } from '../../hooks/useWallet';
import { MONAD_TESTNET_CHAIN_ID } from '../../constants/contractAddresses';

const ConnectWallet = ({ compact = false }) => {
  const { connect, disconnect, address, isConnected, chainId, isConnecting, switchNetwork, isCorrectNetwork } = useWallet();
  const [showMenu, setShowMenu] = useState(false);

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle connect button click
  const handleConnect = async () => {
    if (isConnecting) return;
    
    try {
      await connect();
    } catch (error) {
      console.error('Connect error handled in wallet store:', error);
    }
  };

  // Handle disconnect button click
  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
  };

  // Handle switch network button click
  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork();
      setShowMenu(false);
    } catch (error) {
      console.error('Switch network error:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

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

  // If connected but on wrong network, show switch network button
  if (!isCorrectNetwork) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
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
        
        {showMenu && (
          <div 
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              <div className="px-4 py-2 text-sm text-dark-500 dark:text-dark-400">
                Please switch to Monad Testnet
              </div>
              
              <button
                onClick={handleSwitchNetwork}
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
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
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
      
      {showMenu && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 z-50"
          onClick={(e) => e.stopPropagation()}
        >
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