"use client"
import { motion } from "framer-motion"
import Layout from "../components/layout/Layout"
import { ArrowRight, Award, Gift, Shield, Ticket } from "lucide-react"

const AboutClientPage = () => {
  // Fade-in animation for sections
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <Layout>
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
                About Monad Lottery
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-2 rounded-full"></div>
            </motion.div>

            <div className="prose dark:prose-invert prose-lg max-w-none">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-900 p-6 rounded-xl shadow-sm mb-10"
              >
                <p className="text-lg leading-relaxed">
                  The Monad Lottery is an unofficial lottery giveaway running on the Monad testnet. It provides a fun
                  way to engage with the Monad blockchain while having a chance to win prizes.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10"
              >
                <div className="flex items-center mb-4">
                  <Ticket className="w-6 h-6 text-purple-600 mr-2" />
                  <h2 className="text-2xl font-bold">How It Works</h2>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
                  <p>
                    Participants can purchase lottery tickets using Monad testnet tokens (MON). Each ticket costs 0.01
                    MON and gives you an entry into the lottery drawing. The more tickets you purchase, the higher your
                    chances of winning.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-10"
              >
                <div className="flex items-center mb-4">
                  <Gift className="w-6 h-6 text-purple-600 mr-2" />
                  <h2 className="text-2xl font-bold">Prize Distribution</h2>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
                  <p>The total prize pool is distributed as follows:</p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-start">
                      <div className="bg-purple-900/30 p-2 rounded-full mr-3 mt-1">
                        <Award className="w-4 h-4 text-purple-600 text-purple-400" />
                      </div>
                      <div>
                        <strong className="text-purple-600 text-purple-400">First Place (40%):</strong> The holder of
                        the first winning ticket receives 40% of the total prize pool.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-900/30 p-2 rounded-full mr-3 mt-1">
                        <Award className="w-4 h-4 text-purple-500 text-purple-300" />
                      </div>
                      <div>
                        <strong className="text-purple-500 text-purple-300">Second Place (20%):</strong> The holder of
                        the second winning ticket receives 20% of the total prize pool.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-900/30 p-2 rounded-full mr-3 mt-1">
                        <Award className="w-4 h-4 text-purple-400 text-purple-200" />
                      </div>
                      <div>
                        <strong className="text-purple-400 text-purple-200">Third Place (10%):</strong> The holder of
                        the third winning ticket receives 10% of the total prize pool.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-900/30 p-2 rounded-full mr-3 mt-1">
                        <Ticket className="w-4 h-4 text-pink-500 text-pink-300" />
                      </div>
                      <div>
                        <strong className="text-pink-500 text-pink-300">Top Buyer (10%):</strong> The person who
                        purchases the most tickets receives 10% of the prize pool.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-900/30 p-2 rounded-full mr-3 mt-1">
                        <Shield className="w-4 h-4 text-gray-500 text-gray-400" />
                      </div>
                      <div>
                        <strong className="text-gray-500 text-gray-400">Administration (20%):</strong> The remaining 20%
                        is used for administration and maintenance of the lottery system.
                      </div>
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-10"
              >
                <div className="flex items-center mb-4">
                  <ArrowRight className="w-6 h-6 text-purple-600 mr-2" />
                  <h2 className="text-2xl font-bold">Winner Selection</h2>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
                  <p>
                    Winners are selected using Google's random number generator. The winning ticket numbers are chosen
                    at random, and prizes are automatically distributed to the winners' wallets once the lottery round
                    concludes.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mb-10"
              >
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600 mr-2" />
                  <h2 className="text-2xl font-bold">Transparency</h2>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
                  <p>
                    The Monad Lottery operates on a smart contract deployed on the Monad testnet. All transactions,
                    ticket purchases, and prize distributions are recorded on the blockchain, ensuring full transparency
                    and fairness for all participants.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl">
                  <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
                  <p className="text-gray-300">
                    This is an unofficial lottery running on the Monad testnet. It is not affiliated with the Monad team
                    or any official Monad entity. The lottery is for entertainment purposes only, and participants
                    should be aware that testnet tokens have no real monetary value.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AboutClientPage
