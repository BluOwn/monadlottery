import { useState } from 'react';
import { FiMinus, FiPlus, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import AlertBox from '../shared/AlertBox';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import ConnectWallet from '../shared/ConnectWallet';
import { useWallet } from '../../hooks/useWallet';
import { useLottery } from '../../hooks/useLottery';

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
  const { isConnected } = useWallet();
  const { ticketPrice, buyTickets, lotteryStatus, error: lotteryError, loading } = useLottery();

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
    if (!isConnected) return;
    
    setIsProcessing(true);
    try {
      await buyTickets(quantity);
      // Success is handled in the store with toast notifications
      setQuantity(1); // Reset quantity after purchase
    } catch (err) {
      console.error('Error in purchase handler:', err);
      // Error is handled in the store with toast notifications
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="ticket-purchase" className="py-16 bg-dark-50 dark:bg-dark-800">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <Card 
            className="border-2 border-primary-200 dark:border-primary-800"
            title="Buy Lottery Tickets"
            subtitle={`Each ticket costs ${ticketPrice} MON. The more tickets you buy, the higher your chances!`}
          >
            {/* Show alerts */}
            {!lotteryStatus.isActive && (
              <AlertBox 
                type="error" 
                icon={<FiAlertCircle />} 
                message="The lottery is currently closed. No more tickets can be purchased." 
              />
            )}

            {lotteryError && (
              <AlertBox 
                type="error" 
                icon={<FiAlertCircle />} 
                message={lotteryError} 
              />
            )}

            {loading && !isProcessing && (
              <div className="mb-4">
                <LoadingSpinner text="Loading lottery data..." center />
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* Quantity selector */}
              <QuantitySelector 
                quantity={quantity} 
                onChange={handleQuantityChange}
                onDecrease={decreaseQuantity}
                onIncrease={increaseQuantity}
                disabled={!lotteryStatus.isActive || isProcessing || loading}
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
                  disabled={!lotteryStatus.isActive || isProcessing || loading}
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