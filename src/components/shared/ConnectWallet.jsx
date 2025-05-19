import { useState, useEffect } from 'react';
import Link from 'next/link'; // Fix: Import Next.js Link component
import { FiWifi, FiUser } from 'react-icons/fi';
import { useWallet } from '../../hooks/useWallet';
import { MONAD_TESTNET_CHAIN_ID } from '../../constants/contractAddresses'; // Fix: Import chain ID from constants

const ConnectWallet = ({ compact = false }) => {
  const { connect, disconnect, address, isConnected, chainId } = useWallet();
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  useEffect(() => {
    if (!chainId) {
      setIsCorrectChain(false);
      return;
    }
    
    // Fix: Normalize chain IDs before comparison to handle different formats
    const normalizeChainId = (id) => {
      if (typeof id === 'string') {
        // Remove '0x' prefix if present and convert to number
        return id.startsWith('0x') ? parseInt(id, 16).toString() : id;
      }
      return id.toString();
    };
    
    // Compare the normalized chain IDs
    setIsCorrectChain(normalizeChainId(chainId) === normalizeChainId(MONAD_TESTNET_CHAIN_ID));
  }, [chainId]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className={`${
          compact
            ? 'px-2 py-2 text-primary-600 dark:text-primary-500'
            : 'btn-primary'
        }`}
      >
        <FiWifi className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
        {!compact && <span>Connect Wallet</span>}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleDisconnect}
        className={`${
          isCorrectChain
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        } ${
          compact
            ? 'px-2 py-2 rounded-full'
            : 'btn'
        } transition-colors duration-300`}
      >
        <FiUser className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
        {!compact && (
          <span>
            {isCorrectChain
              ? formatAddress(address)
              : 'Wrong Network'}
          </span>
        )}
      </button>
    </div>
  );
};

export default ConnectWallet;