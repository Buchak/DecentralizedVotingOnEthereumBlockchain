import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import ListPoll from './components/ListPoll.jsx';
import Login from './components/Login.jsx';
import Poll from './pages/Poll.jsx';
import Form from './pages/Form.jsx';
import Profile from './pages/Profile.jsx';
import { ethers } from 'ethers';

export default function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  async function connectToMetaMask() {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        await web3Provider.send('eth_requestAccounts', []);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        console.log('Connected account: ' + address);
        setAccount(address);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      console.error('MetaMask not detected');
    }
  }

  return (
    <BrowserRouter>
      <>
        <Header
          isConnected={isConnected}
          connectWallet={connectToMetaMask}
          account={account}
        />
        <main>
          {!isConnected ? (
            <Login connectWallet={connectToMetaMask} />
          ) : (
            <Routes>
              <Route
                path='/'
                element={
                  <section>
                    <h1>Список опитувань</h1>
                    <ListPoll />
                  </section>
                }
              />
              <Route path='/create' element={<Form />} />
              <Route path='/poll/:id' element={<Poll />} />
              <Route path='/profile' element={<Profile />} />
            </Routes>
          )}
        </main>
      </>
    </BrowserRouter>
  );
}
