import React, { useCallback, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import ConnectWalletButton from './components/ConnectWalletButton';

function App() {
  const [, setSelectedAddress] = useState<string>();

  const addressChanged = useCallback((address: string | undefined) => {
    setSelectedAddress(address);
  }, []);
  return (
    <ConnectWalletButton onChange={addressChanged} />
  );
}

export default App;
