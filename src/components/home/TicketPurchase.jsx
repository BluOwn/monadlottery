import { useState, useEffect } from 'react';
import { FiMinus, FiPlus, FiShoppingCart, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import AlertBox from '../shared/AlertBox';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import ConnectWallet from '../shared/ConnectWallet';
import { useWallet } from '../../hooks/useWallet';
import { useLottery } from '../../hooks/useLottery';
import toast from 'react-hot-toast';

// Debug logger
const logDebug = (message, data = null) => {
  console.log(`[TICKET PURCHASE] ${message}`, data || '');
};

// Quantity selector component
const QuantitySelector = ({ quantity, onChange, onDecrease, onIncrease, disabled }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor="quantity" className="text-lg font-medium text-dark-800 dark:text-dark-200">
      Ticket Quantity
    </label>
    <div className="flex items-center">
      <button 
        onClick={onDecrease}
        className="px-3 py-2 bg-dark-100 dark:bg-dark-700 rounded-l-lg hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
        disabled={quantity <= 1 || disabled}
      >
        <FiMinus />
      </button>
      <input
        id="quantity"
        type="number"
        min="1"
        value={quantity}
        onChange={onChange}
        className="w-20 px-4 py-2 text-center border-y border-dark-300 dark:border-dark-600
          bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none disabled:opacity-50"
        disabled={disabled}
      />
      <button 
        onClick={onIncrease}
        className="px-3 py-2 bg-dark-100 dark:bg-dark-700 rounded-r-lg hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
        disabled={disabled}
      >
        <FiPlus />
      </button>
    </div>
  </div>
);

// Price summary component
const PriceSummary = ({ ticketPrice, quantity, totalCost }) => (
  <div className="p-4 bg-dark-100 dark:bg-dark-700 rounded-lg">
    <div className="flex justify-between mb-2">
      <span className="text-dark-600 dark:text-dark-400">Price per ticket:</span>
      <span className="font-medium text-dark-800 dark:text-dark-200">{ticketPrice} MON</span>
    </div>
    <div className="flex justify-between mb-2">
      <span className="text-dark-600 dark:text-dark-400">Quantity:</span>
      <span className="font-medium text-dark-800 dark:text-dark-200">{quantity}</span>
    </div>
    <div className="border-t border-dark-300 dark:border-dark-600 my-2 pt-2">
      <div className="flex justify-between">
        <span className="font-medium text-dark-800 dark:text-dark-200">Total:</span>
        <span className="font-bold text-lg text-dark-900 dark:text-white">{totalCost} MON</span>
      </div>
    </div>
  </div>
);

// Purchase button component
const PurchaseButton = ({ onClick, disabled, isProcessing }) => (
  <button
    onClick={onClick}
    className="btn-primary py-3 w-full"
    disabled={disabled}
  >
    {isProcessing ? (
      <div className="flex items-center justify-center gap-2">
        <LoadingSpinner size="sm" />
        <span>Processing...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2">
        <FiShoppingCart className="h-5 w-5" />
        <span>Buy Tickets</span>
      </div>
    )}
  </button>
);

// Main component
const TicketPurchase = () => {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected, address, readProvider } = useWallet();
  const { 
    ticketPrice, 
    buyTickets, 
    lotteryStatus, 
    error: lotteryError, 
    loading, 
    refreshStatus, 
    refreshUserTickets 
  } = useLottery();

  // Handle initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      logDebug('Loading initial lottery data');
      setInitializing(true);
      try {
        // Check if we have a read provider
        if (!readProvider) {
          logDebug('No read provider available yet');
          return;
        }
        
        logDebug('Refreshing lottery status');
        await refreshStatus();
        logDebug('Initial data loaded successfully');
      } catch (err) {
        console.error('Error loading initial lottery data:', err);
        logDebug('Error loading initial data', err);
      } finally {
        setInitializing(false);
      }
    };

    loadInitialData();
  }, [refreshStatus, readProvider]);

  // Handle data refresh when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      logDebug('Wallet connected, refreshing user tickets', { address });
      refreshUserTickets().catch(err => {
        console.error('Error refreshing user tickets after wallet connect:', err);
        logDebug('Error refreshing user tickets', err);
      });
    }
  }, [isConnected, address, refreshUserTickets]);

  // Monitor lottery status changes for debugging
  useEffect(() => {
    logDebug('Lottery status updated', lotteryStatus);
  }, [lotteryStatus]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const totalCost = (parseFloat(ticketPrice) * quantity).toFixed(2);

  const handlePurchase = async () => {
    if (!isConnected) {
      logDebug('Cannot purchase: wallet not connected');
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsProcessing(true);
    logDebug('Processing purchase', { quantity, totalCost });
    
    try {
      await buyTickets(quantity);
      // Success is handled in the store with toast notifications
      setQuantity(1); // Reset quantity after purchase
      logDebug('Purchase successful');
    } catch (err) {
      console.error('Error in purchase handler:', err);
      logDebug('Purchase error', err);
      // Error is handled in the store with toast notifications
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    logDebug('Manual refresh requested');
    setRefreshing(true);
    
    try {
      const loadingToast = toast.loading('Refreshing lottery data...');
      
      // First refresh lottery status
      await refreshStatus();
      
      // Then refresh user tickets if connected
      if (isConnected && address) {
        await refreshUserTickets();
      }
      
      toast.success('Lottery data refreshed!', { id: loadingToast });
      logDebug('Manual refresh completed successfully');
    } catch (err) {
      console.error('Error refreshing data:', err);
      logDebug('Manual refresh error', err);
      toast.error('Failed to refresh lottery data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Determine if we should show the loading state
  const isLoading = loading || initializing || refreshing;

  // Determine if lottery is active (only if we have loaded data)
  const isLotteryActive = !isLoading && lotteryStatus.isActive;

  logDebug('Render state', { 
    isLoading, 
    loading, 
    initializing,
    refreshing,
    isLotteryActive,
    lotteryStatus
  });

  return (
    <div id="ticket-purchase" className="py-16 bg-dark-50 dark:bg-dark-800">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <Card 
            className="border-2 border-primary-200 dark:border-primary-800"
            title={
              <div className="flex justify-between items-center">
                <span>Buy Lottery Tickets</span>
                <button 
                  onClick={handleRefresh}
                  className="p-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  disabled={isLoading || isProcessing}
                  title="Refresh lottery data"
                >
                  <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>
            }
            subtitle={`Each ticket costs ${ticketPrice} MON. The more tickets you buy, the higher your chances!`}
          >
            {/* Loading state */}
            {isLoading && (
              <div className="mb-4">
                <LoadingSpinner text="Loading lottery data..." center />
              </div>
            )}

            {/* Error states - only show when not loading */}
            {!isLoading && !isLotteryActive && (
              <AlertBox 
                type="error" 
                icon={<FiAlertCircle />} 
                message="The lottery is currently closed. No more tickets can be purchased." 
              />
            )}

            {!isLoading && lotteryError && (
              <AlertBox 
                type="error" 
                icon={<FiAlertCircle />} 
                message={lotteryError} 
              />
            )}

            <div className="flex flex-col gap-6">
              {/* Quantity selector */}
              <QuantitySelector 
                quantity={quantity} 
                onChange={handleQuantityChange}
                onDecrease={decreaseQuantity}
                onIncrease={increaseQuantity}
                disabled={!isLotteryActive || isProcessing || isLoading}
              />

              {/* Price summary */}
              <PriceSummary ticketPrice={ticketPrice} quantity={quantity} totalCost={totalCost} />

              {/* Action button */}
              {!isConnected ? (
                <div className="text-center">
                  <p className="mb-4 text-dark-600 dark:text-dark-400">
                    Connect your wallet to buy tickets
                  </p>
                  <ConnectWallet />
                </div>
              ) : (
                <PurchaseButton 
                  onClick={handlePurchase} 
                  disabled={!isLotteryActive || isProcessing || isLoading}
                  isProcessing={isProcessing} 
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;