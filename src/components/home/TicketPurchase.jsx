import { useState } from 'react';
import { FiMinus, FiPlus, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import { useWallet } from '../../hooks/useWallet';
import { useLottery } from '../../hooks/useLottery';
import ConnectWallet from '../shared/ConnectWallet';
import toast from 'react-hot-toast';

const TicketPurchase = () => {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isConnected } = useWallet();
  const { ticketPrice, buyTickets, lotteryStatus, error: lotteryError } = useLottery();

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
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await buyTickets(quantity);
      
      if (success) {
        toast.success(`Successfully purchased ${quantity} ticket${quantity !== 1 ? 's' : ''}!`);
        setQuantity(1); // Reset quantity after purchase
      } else {
        toast.error('Failed to purchase tickets. Please try again.');
      }
    } catch (err) {
      console.error('Error purchasing tickets:', err);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="ticket-purchase" className="py-16 bg-dark-50 dark:bg-dark-800">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="card border-2 border-primary-200 dark:border-primary-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                Buy Lottery Tickets
              </h2>
              <p className="text-dark-600 dark:text-dark-400">
                Each ticket costs {ticketPrice} MON. The more tickets you buy, the higher your chances!
              </p>
            </div>

            {!lotteryStatus.isActive && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
                <FiAlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400">
                  The lottery is currently closed. No more tickets can be purchased.
                </p>
              </div>
            )}

            {lotteryError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
                <FiAlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400">{lotteryError}</p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="quantity" className="text-lg font-medium text-dark-800 dark:text-dark-200">
                  Ticket Quantity
                </label>
                <div className="flex items-center">
                  <button 
                    onClick={decreaseQuantity}
                    className="px-3 py-2 bg-dark-100 dark:bg-dark-700 rounded-l-lg hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
                    disabled={quantity <= 1 || !lotteryStatus.isActive || isProcessing}
                  >
                    <FiMinus />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-20 px-4 py-2 text-center border-y border-dark-300 dark:border-dark-600
                      bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none"
                    disabled={!lotteryStatus.isActive || isProcessing}
                  />
                  <button 
                    onClick={increaseQuantity}
                    className="px-3 py-2 bg-dark-100 dark:bg-dark-700 rounded-r-lg hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
                    disabled={!lotteryStatus.isActive || isProcessing}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

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

              {!isConnected ? (
                <div className="text-center">
                  <p className="mb-4 text-dark-600 dark:text-dark-400">
                    Connect your wallet to buy tickets
                  </p>
                  <ConnectWallet />
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  className="btn-primary py-3"
                  disabled={!lotteryStatus.isActive || isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiShoppingCart />
                      Buy Tickets
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;