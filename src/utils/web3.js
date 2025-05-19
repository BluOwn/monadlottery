import { ethers } from 'ethers';
import { MONAD_TESTNET_CONFIG } from '../constants/contractAddresses';

/**
 * Check if MetaMask or another web3 wallet is installed
 * @returns {boolean} Whether a web3 wallet is detected
 */
export const isWalletInstalled = () => {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
};

/**
 * Get the current blockchain network
 * @returns {Promise<string>} Network name or chain ID
 */
export const getNetwork = async () => {
  if (!isWalletInstalled()) return null;
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    return network;
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

/**
 * Check if the wallet is connected to the Monad testnet
 * @param {string} chainId - Current chain ID
 * @returns {boolean} Whether connected to Monad testnet
 */
export const isMonadTestnet = (chainId) => {
  if (!chainId) return false;
  
  // Create normalized versions of the chainId for comparison
  const normalizedChainId = chainId.startsWith('0x') ? parseInt(chainId, 16).toString() : chainId;
  const monadChainId = MONAD_TESTNET_CHAIN_ID;
  
  return normalizedChainId === monadChainId;
};

/**
 * Switch to the Monad testnet
 * @returns {Promise<boolean>} Whether switch was successful
 */
export const switchToMonadTestnet = async () => {
  if (!isWalletInstalled()) return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${MONAD_TESTNET_CONFIG.id.toString(16)}` }],
    });
    return true;
  } catch (switchError) {
    // If the chain hasn't been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${MONAD_TESTNET_CONFIG.id.toString(16)}`,
              chainName: MONAD_TESTNET_CONFIG.name,
              nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
              rpcUrls: MONAD_TESTNET_CONFIG.rpcUrls.default.http,
              blockExplorerUrls: [MONAD_TESTNET_CONFIG.blockExplorers.default.url],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Monad testnet:', addError);
        return false;
      }
    }
    console.error('Error switching to Monad testnet:', switchError);
    return false;
  }
};

/**
 * Get a contract instance
 * @param {string} address - Contract address
 * @param {Array} abi - Contract ABI
 * @param {object} signerOrProvider - Ethers signer or provider
 * @returns {object} Contract instance
 */
export const getContract = (address, abi, signerOrProvider) => {
  if (!address || !abi || !signerOrProvider) return null;
  
  try {
    return new ethers.Contract(address, abi, signerOrProvider);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
};

/**
 * Format blockchain timestamp to human-readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  // Blockchain timestamps are usually in seconds, not milliseconds
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Format value from wei to ether
 * @param {string} value - Value in wei
 * @returns {string} Value in ether
 */
export const fromWei = (value) => {
  if (!value) return '0';
  return ethers.utils.formatEther(value);
};

/**
 * Format value from ether to wei
 * @param {string} value - Value in ether
 * @returns {string} Value in wei
 */
export const toWei = (value) => {
  if (!value) return '0';
  return ethers.utils.parseEther(value.toString());
};