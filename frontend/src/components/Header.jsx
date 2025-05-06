import Button from './Button.jsx';
import logo from '/favpng_blockchain-vector-graphics-illustration-bitcoin.png';
import './Header.css';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Header({ isConnected, account, connectWallet }) {
  const [content, setContent] = useState('none');

  function typeChange(type) {
    setContent(type);
  }

  return (
    <header className='header'>
      <NavLink to='/' className='logo-link' onClick={() => typeChange('home')}>
        <div className='logo'>
          <img src={logo} alt={'Logo'} />
          <h3>Blockchain Опитування</h3>
        </div>
      </NavLink>
      <div className='header-controls'>
        {isConnected ? (
          <div>
            <span style={{ fontWeight: 'bold', marginRight: '16px' }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <NavLink to='/create' onClick={() => typeChange('create')}>
              <Button isActive={content === 'create'}>Створити</Button>
            </NavLink>
            <NavLink to='/profile' onClick={() => typeChange('profile')}>
              <Button isActive={content === 'profile'} variant='profile'>
                Профіль
              </Button>
            </NavLink>
          </div>
        ) : (
          <button className='connect-button' onClick={connectWallet}>
            Підключити гаманець
          </button>
        )}
      </div>
    </header>
  );
}
