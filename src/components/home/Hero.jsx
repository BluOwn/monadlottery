import { FiArrowRight } from 'react-icons/fi';
import ConnectWallet from '../shared/ConnectWallet';
import { useWallet } from '../../hooks/useWallet';

const Hero = () => {
  const { isConnected } = useWallet();

  const scrollToTickets = () => {
    const ticketSection = document.getElementById('ticket-purchase');
    if (ticketSection) {
      ticketSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 -z-10" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-300/20 dark:bg-primary-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary-300/20 dark:bg-secondary-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-300/20 dark:bg-accent-700/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container-custom py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark-900 dark:text-white">
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Monad Lottery
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-dark-600 dark:text-dark-300 mb-8">
            An unofficial lottery giveaway on Monad testnet. Winners will be chosen from Google random number generator.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected ? (
              <ConnectWallet />
            ) : (
              <button 
                onClick={scrollToTickets}
                className="btn-primary"
              >
                Buy Tickets
                <FiArrowRight />
              </button>
            )}
            
            <a
              href="https://twitter.com/intent/tweet?text=I just entered the Monad Lottery! Join at https://lottery.monadescrow.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Share on Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;