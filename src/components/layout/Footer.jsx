"use client"

import Link from "next/link"
import { Github, FileText, Twitter } from "lucide-react"
import { motion } from "framer-motion"

// Assuming these constants are defined elsewhere in your project
const SOCIAL_LINKS = {
  GITHUB: "https://github.com/BluOwn/monadlottery",
  CONTRACT_EXPLORER: "https://testnet.monadexplorer.com/address/0xC9105a5DDDF4605C98712568cF2AA0367f6AaBA2",
  TWITTER: "https://twitter.com/Oprimedev",
}

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "Github",
      href: SOCIAL_LINKS.GITHUB,
      icon: <Github className="h-4 w-4" />,
    },
    {
      name: "Contract",
      href: SOCIAL_LINKS.CONTRACT_EXPLORER,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      name: "Twitter",
      href: SOCIAL_LINKS.TWITTER,
      icon: <Twitter className="h-4 w-4" />,
    },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <footer className="bg-gray-950 py-4 border-t border-gray-800">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          {/* Branding and Social Links */}
          <motion.div variants={itemVariants} className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              Monad Lottery
            </Link>
            <div className="h-4 w-px bg-gray-800 hidden md:block"></div>
            <div className="flex items-center space-x-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors p-1"
                  aria-label={link.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="flex items-center mt-3 md:mt-0">
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">
                Contact
              </Link>
              <Link href="/contract" className="text-gray-400 hover:text-purple-400 transition-colors">
                Contract
              </Link>
              <span className="text-gray-600">•</span>
              <span className="text-gray-500 text-xs">© {currentYear} Monad Lottery</span>
            </nav>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
