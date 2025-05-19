import { ethers } from 'ethers';

/**
 * Format an address to a shortened form
 * @param {string} address - Ethereum address to format
 * @param {number} startChars - Number of characters to show at the start
 * @param {number} endChars - Number of characters to show at the end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format value from wei to ether
 * @param {string|BigNumber} value - Value in wei
 * @returns {string} Value in ether
 */
export const formatEther = (value) => {
  if (!value) return '0';
  return ethers.utils.formatEther(value);
};

/**
 * Format value from ether to wei
 * @param {string|number} value - Value in ether
 * @returns {BigNumber} Value in wei
 */
export const parseEther = (value) => {
  if (!value) return ethers.constants.Zero;
  return ethers.utils.parseEther(value.toString());
};

/**
 * Normalize chain ID to string format for comparison
 * @param {string|number} chainId - Chain ID to normalize
 * @returns {string} Normalized chain ID
 */
export const normalizeChainId = (chainId) => {
  if (typeof chainId === 'string') {
    return chainId.startsWith('0x') ? parseInt(chainId, 16).toString() : chainId;
  }
  return chainId.toString();
};

/**
 * Check if window object is available (client-side)
 * @returns {boolean} Whether browser environment is available
 */
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Safe call to async function with error handling
 * @param {Function} fn - Function to call
 * @param {string} errorMessage - Error message prefix
 * @returns {Promise<any>} Result or null on error
 */
export const safeCall = async (fn, errorMessage = 'Error') => {
  try {
    return await fn();
  } catch (err) {
    console.error(`${errorMessage}:`, err);
    return null;
  }
};

/**
 * Format number with thousands separators
 * @param {number|string} value - Number to format
 * @param {number} decimals - Decimal places to show
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  if (!value) return '0';
  const num = parseFloat(value);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Convert UTC timestamp to local date/time
 * @param {number} timestamp - Unix timestamp (seconds)
 * @returns {string} Formatted date
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  if (!isBrowser() || !navigator.clipboard) return false;
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Create a delay/sleep function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));