import Link from 'next/link';
import { FiGithub, FiTwitter, FiFileText } from 'react-icons/fi';
import { SOCIAL_LINKS } from '../../constants/contractAddresses';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    {
      name: 'Github',
      href: SOCIAL_LINKS.GITHUB,
      icon: <FiGithub className="h-5 w-5" />,
    },
    {
      name: 'Contract',
      href: SOCIAL_LINKS.CONTRACT_EXPLORER,
      icon: <FiFileText className="h-5 w-5" />,
    },
    {
      name: 'Twitter',
      href: SOCIAL_LINKS.TWITTER,
      icon: <FiTwitter className="h-5 w-5" />,
    },
  ];

  return (
    <footer className="bg-white dark:bg-dark-900 py-8 border-t border-dark-200 dark:border-dark-700">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="flex flex-col">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
              Monad Lottery
            </Link>
            <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
              Unofficial lottery giveaway on Monad testnet
            </p>
            <div className="flex gap-4 mt-auto">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-500 hover:text-primary-600 dark:text-dark-400 dark:hover:text-primary-500 transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-dark-800 dark:text-dark-200">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/contract" className="text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors">
                  Contract
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter/Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-dark-800 dark:text-dark-200">
              Stay Updated
            </h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
              Join our community to stay updated with the latest lottery news.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-200 dark:border-dark-700 text-center text-sm text-dark-500 dark:text-dark-400">
          <p>
            © {currentYear} Monad Lottery. All rights reserved. Website:{' '}
            <a 
              href="https://lottery.monadescrow.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              lottery.monadescrow.xyz
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;