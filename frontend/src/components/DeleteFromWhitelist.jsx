import { useState } from 'react';
import { ethers } from 'ethers';
import { PollContractABI, PollContractAddress } from '../constant/constant.js';
import { toast } from 'react-toastify';

export default function DeleteFromWhitelist({ pollId }) {
  const [addresses, setAddresses] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleAddressChange = (index, value) => {
    const updated = [...addresses];
    updated[index] = value;
    setAddresses(updated);
  };

  const handleAddAddressField = () => {
    setAddresses([...addresses, '']);
  };

  const handleRemoveAddressField = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    const whiteAddresses = addresses.filter((addr) =>
      ethers.utils.isAddress(addr)
    );

    if (whiteAddresses.length === 0) {
      toast.error('Введіть хоча б одну коректну адресу для видалення');
      return;
    }

    try {
      setLoading(true);
      toast.info('Видалення адрес із whitelist...');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      const tx = await contract.deleteAddressFromWhitelist(
        pollId,
        whiteAddresses
      );
      await tx.wait();

      toast.success('Успішно видалено з whitelist ✅');
      setAddresses(['']); // Очистити форму після успіху
    } catch (error) {
      console.error(error);
      toast.error(`Помилка: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='delete-from-whitelist'>
      <h3>Видалити адреси з Whitelist</h3>

      {addresses.map((address, index) => (
        <div key={index} className='address-row'>
          <input
            className='form-control'
            type='text'
            placeholder={`Адреса ${index + 1}`}
            value={address}
            onChange={(e) => handleAddressChange(index, e.target.value)}
          />
          <button
            type='button'
            className='btn-remove-field'
            onClick={() => handleRemoveAddressField(index)}
          >
            ❌
          </button>
        </div>
      ))}

      <button className='btn-add-field' onClick={handleAddAddressField}>
        ➕ Додати ще
      </button>

      <button className='btn-submit' onClick={handleDelete} disabled={loading}>
        {loading ? 'Видалення...' : 'Видалити адреси'}
      </button>
    </div>
  );
}
