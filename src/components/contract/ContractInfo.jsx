import React, { useState } from 'react';
import { FiExternalLink, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { MONAD_LOTTERY_CONTRACT_ADDRESS, SOCIAL_LINKS } from '../../constants/contractAddresses';

const ContractInfo = () => {
  const [copied, setCopied] = useState(false);
  
  const contractAddress = MONAD_LOTTERY_CONTRACT_ADDRESS;
  const contractExplorerUrl = SOCIAL_LINKS.CONTRACT_EXPLORER;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    toast.success('Contract address copied to clipboard!');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <div className="py-12 bg-white dark:bg-dark-900">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-4">
              Smart Contract Address
            </h2>
            
            <div className="flex items-center p-4 bg-dark-50 dark:bg-dark-800 rounded-lg mb-4">
              <code className="text-sm font-mono text-dark-800 dark:text-dark-200 break-all flex-grow">
                {contractAddress}
              </code>
              <button
                onClick={copyToClipboard}
                className="ml-3 p-2 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-500 focus:outline-none transition-colors"
                aria-label="Copy contract address"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <FiCopy className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="flex justify-center">
              
                href={contractExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2"
              >
                <span>View on Monad Explorer</span>
                <FiExternalLink />
              </a>
            </div>
          </div>
          
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-4">
              Contract Details
            </h2>
            
            <div className="space-y-4">
              <div className="border-b border-dark-200 dark:border-dark-700 pb-4">
                <h3 className="text-lg font-medium text-dark-800 dark:text-dark-200 mb-2">
                  Ticket Price
                </h3>
                <p className="text-dark-600 dark:text-dark-400">
                  0.01 MON per ticket
                </p>
              </div>
              
              <div className="border-b border-dark-200 dark:border-dark-700 pb-4">
                <h3 className="text-lg font-medium text-dark-800 dark:text-dark-200 mb-2">
                  Prize Distribution
                </h3>
                <ul className="list-disc list-inside text-dark-600 dark:text-dark-400 space-y-1">
                  <li>First Place: 40% of total pool</li>
                  <li>Second Place: 20% of total pool</li>
                  <li>Third Place: 10% of total pool</li>
                  <li>Top Buyer: 10% of total pool</li>
                  <li>Administration: 20% of total pool</li>
                </ul>
              </div>
              
              <div className="border-b border-dark-200 dark:border-dark-700 pb-4">
                <h3 className="text-lg font-medium text-dark-800 dark:text-dark-200 mb-2">
                  Winner Selection
                </h3>
                <p className="text-dark-600 dark:text-dark-400">
                  Winners are selected using Google's random number generator. 
                  The contract owner inputs the three winning ticket numbers, and 
                  prizes are automatically distributed to the winners.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-dark-800 dark:text-dark-200 mb-2">
                  Contract Features
                </h3>
                <ul className="list-disc list-inside text-dark-600 dark:text-dark-400 space-y-1">
                  <li>Buy multiple tickets at once</li>
                  <li>Automatic prize distribution</li>
                  <li>Special reward for top buyer</li>
                  <li>View your purchased tickets</li>
                  <li>Check lottery status</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-4">
              Contract Code
            </h2>
            
            <p className="text-dark-600 dark:text-dark-400 mb-4">
              The Monad Lottery smart contract is open source. You can view the 
              source code below or on our GitHub repository.
            </p>
            
            <div className="relative">
              <div className="absolute top-0 right-0 p-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("// Full contract code available on GitHub");
                    toast.success('Contract code copied to clipboard!');
                  }}
                  className="p-2 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-500 focus:outline-none transition-colors"
                  aria-label="Copy contract code"
                >
                  <FiCopy className="h-5 w-5" />
                </button>
              </div>
              
              <div className="overflow-x-auto bg-dark-50 dark:bg-dark-800 rounded-lg p-4">
                <pre className="text-sm font-mono text-dark-800 dark:text-dark-200 whitespace-pre-wrap">
                  {`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title MonadLottery
 * @dev A lottery contract where users can buy tickets for 0.01 MON each
 * Website: lottery.monadescrow.xyz
 */
contract MonadLottery is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Events
    event TicketPurchased(address indexed buyer, uint256[] ticketNumbers);
    event WinnersSelected(
        address indexed firstPlace, 
        address indexed secondPlace, 
        address indexed thirdPlace, 
        uint256 firstPrize,
        uint256 secondPrize,
        uint256 thirdPrize
    );
    
    // More code... (truncated for space)
    
    // See full code on GitHub or Monad Explorer
}`}
                </pre>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              
                href={SOCIAL_LINKS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2"
              >
                <span>View Full Code on GitHub</span>
                <FiExternalLink />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;