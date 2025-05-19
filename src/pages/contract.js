"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Layout from "../components/layout/Layout"
import { Copy, ExternalLink, Check, Ticket, Gift, Shuffle, Code } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

// Assuming these constants are defined elsewhere in your project
const MONAD_LOTTERY_CONTRACT_ADDRESS = "0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2"
const SOCIAL_LINKS = {
  CONTRACT_EXPLORER: "https://testnet.monadexplorer.com/address/0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2",
  GITHUB: "https://github.com/BluOwn/monadlottery",
}

const ContractClientPage = () => {
  const [copied, setCopied] = useState(false)

  const contractAddress = MONAD_LOTTERY_CONTRACT_ADDRESS
  const contractExplorerUrl = SOCIAL_LINKS.CONTRACT_EXPLORER

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(contractAddress)
      setCopied(true)
      toast.success("Contract address copied to clipboard!")

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  const copyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("// Full contract code available on GitHub")
      toast.success("Contract code copied to clipboard!")
    }
  }

  // Fade-in animation for sections
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <Layout>
      <Toaster position="top-right" />

      <div className="py-20 bg-gradient-to-b from-gray-950 to-black">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center"
            >
              <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 inline-block">
                Contract Information
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-2 rounded-full"></div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-900 p-6 rounded-xl shadow-sm mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="bg-purple-900/30 p-2 rounded-full mr-3">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                Smart Contract Address
              </h2>

              <div className="flex items-center p-4 bg-gray-800 rounded-lg mb-4">
                <code className="text-sm font-mono text-gray-200 break-all flex-grow">{contractAddress}</code>
                <button
                  onClick={copyToClipboard}
                  className="ml-3 p-2 text-gray-400 hover:text-purple-400 focus:outline-none transition-colors"
                  aria-label="Copy contract address"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex justify-center">
                <a
                  href={contractExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent hover:bg-purple-900/30 text-purple-400 font-semibold py-2 px-4 border border-purple-500 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span>View on Monad Explorer</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900 p-6 rounded-xl shadow-sm mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="bg-purple-900/30 p-2 rounded-full mr-3">
                  <Ticket className="w-5 h-5 text-purple-400" />
                </div>
                Contract Details
              </h2>

              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-medium text-gray-200 mb-2">Ticket Price</h3>
                  <p className="text-gray-400">0.01 MON per ticket</p>
                </div>

                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-medium text-gray-200 mb-2 flex items-center">
                    <div className="bg-purple-900/20 p-1 rounded-full mr-2">
                      <Gift className="w-4 h-4 text-purple-400" />
                    </div>
                    Prize Distribution
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>First Place: 40% of total pool</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>Second Place: 20% of total pool</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>Third Place: 10% of total pool</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-pink-400 rounded-full"></span>
                      </div>
                      <span>Top Buyer: 10% of total pool</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
                      </div>
                      <span>Administration: 20% of total pool</span>
                    </li>
                  </ul>
                </div>

                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-medium text-gray-200 mb-2 flex items-center">
                    <div className="bg-purple-900/20 p-1 rounded-full mr-2">
                      <Shuffle className="w-4 h-4 text-purple-400" />
                    </div>
                    Winner Selection
                  </h3>
                  <p className="text-gray-400">
                    Winners are selected using Google's random number generator. The contract owner inputs the three
                    winning ticket numbers, and prizes are automatically distributed to the winners.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-200 mb-2">Contract Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>Buy multiple tickets at once</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>Automatic prize distribution</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>Special reward for top buyer</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>View your purchased tickets</span>
                    </li>
                    <li className="flex items-start text-gray-400">
                      <div className="bg-purple-900/10 p-1 rounded-full mr-2 mt-1">
                        <span className="block w-2 h-2 bg-purple-400 rounded-full"></span>
                      </div>
                      <span>Check lottery status</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-900 p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="bg-purple-900/30 p-2 rounded-full mr-3">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                Contract Code
              </h2>

              <p className="text-gray-400 mb-4">
                The Monad Lottery smart contract is open source. You can view the source code below or on our GitHub
                repository.
              </p>

              <div className="relative">
                <div className="absolute top-0 right-0 p-2">
                  <button
                    onClick={copyCode}
                    className="p-2 text-gray-400 hover:text-purple-400 focus:outline-none transition-colors"
                    aria-label="Copy contract code"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-x-auto bg-gray-800 rounded-lg p-4">
                  <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap">
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
    
    // See full code on GitHub or Monad Explorer`}
                  </pre>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <a
                  href={SOCIAL_LINKS.GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent hover:bg-purple-900/30 text-purple-400 font-semibold py-2 px-4 border border-purple-500 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span>View Full Code on GitHub</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ContractClientPage
