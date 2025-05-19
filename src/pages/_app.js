// src/pages/_app.js
import '../styles/globals.css';
import { WalletProvider } from '../contexts/WalletContext';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp;