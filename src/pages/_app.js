import '../styles/globals.css';
import { WalletProvider } from '../hooks/useWallet';

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp;