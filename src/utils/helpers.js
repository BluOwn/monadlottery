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
 * Format an amount of MON to a human-readable string
 * @param {string|number} amount - Amount in wei
 * @param {number} decimals - Number of decimals to display
 * @returns {string} Formatted amount
 */
export const formatMON = (amount, decimals = 2) => {
  if (!amount) return '0';
  
  // Convert to number and fix decimals
  const value = parseFloat(amount);
  
  // Format with thousands separator and fixed decimals
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Delay execution for a given time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if the window object is available (client-side)
 * @returns {boolean} Whether window is available
 */
export const isBrowser = () => {
  return typeof window !== 'undefined';
};

/**
 * Get value from local storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
export const getLocalStorage = (key, defaultValue) => {
  if (!isBrowser()) return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return stored;
  }
};

/**
 * Set value in local storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setLocalStorage = (key, value) => {
  if (!isBrowser()) return;
  if (typeof value === 'object') {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, value);
  }
};

/**
 * Remove key from local storage
 * @param {string} key - Storage key
 */
export const removeLocalStorage = (key) => {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
};