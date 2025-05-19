import { useState, useEffect } from 'react';
import { FiWifi, FiUser } from 'react-icons/fi';
import { useWallet } from '../../hooks/useWallet';

const ConnectWallet = ({ compact = false }) => {
  const { connect, disconnect, address, isConnected, chainId } = useWallet();
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  useEffect(() => {
    // Check if connected to the Monad testnet
    // Replace MONAD_TESTNET_CHAIN_ID with the actual chain ID for Monad testnet
    const MONAD_TESTNET_CHAIN_ID = '0x27af'; // This is a example value, use actual chain ID
    setIsCorrectChain(chainId === MONAD_TESTNET_CHAIN_ID);
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