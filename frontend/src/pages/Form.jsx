import { useState } from 'react';
import deleteIcon from '/delete-button3.jpg';
import './Form.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';
import { PollContractABI, PollContractAddress } from '../constant/constant.js';
import Whitelist from '../components/Whitelist.jsx';

export default function Form() {
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [whitelist, setWhitelist] = useState(['']);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleAddWhitelistAddress = () => {
    setWhitelist([...whitelist, '']);
  };

  // Не використовується
  const handleRemoveWhitelistAddress = (index) => {
    setWhitelist(whitelist.filter((_, i) => i !== index));
  };

  // Не використовується
  const handleWhitelistChange = (index, value) => {
    const updatedWhitelist = [...whitelist];
    updatedWhitelist[index] = value;
    setWhitelist(updatedWhitelist);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let question = e.target.question.value;

    if (isPrivate) {
      question += ' 🔒';
    }

    if (!question || options.some((opt) => !opt.trim())) {
      toast.warning('Заповніть усі поля варіантів!');
      return;
    }

    if (isPrivate && whitelist.some((addr) => !addr.trim())) {
      toast.warning('Заповніть усі поля whitelist!');
      return;
    }

    try {
      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      toast.info('Створення опитування...');

      const poll = await contract.createPoll(
        question,
        options,
        isPrivate,
        isPrivate ? whitelist : []
      );

      await poll.wait();

      toast.success('Опитування успішно створено!');
      e.target.reset();
      setOptions(['', '']);
      setWhitelist(['']);
      setIsPrivate(false);
    } catch (err) {
      console.error('Помилка при створенні опитування:', err);
      toast.error('Помилка при створенні опитування!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className='form-header'>
        <h2>Створення опитування</h2>
        <div className='form-header-buttons'>
          <button type='button' className='btn-add' onClick={handleAddOption}>
            ➕ Додати варіант
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <h3>Питання:</h3>
        <input type='text' id='question' className='control' required />

        <h3>Варіанти відповідей:</h3>
        {options.map((option, index) => (
          <div key={index} className='option-field'>
            <input
              className='form-control'
              type='text'
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Варіант ${index + 1}`}
              required
            />
            <button
              className='delete_button'
              type='button'
              onClick={() => handleRemoveOption(index)}
            >
              <img src={deleteIcon} alt='Видалити' className='delete-icon' />
            </button>
          </div>
        ))}

        <h3>Оберіть тип опитування:</h3>
        <div className='form-header-buttons'>
          <button
            type='button'
            className={isPrivate ? 'btn-checkbox' : 'btn-checkbox-active'}
            onClick={() => setIsPrivate(false)}
          >
            Публічне
          </button>
          <button
            type='button'
            className={isPrivate ? 'btn-checkbox-active' : 'btn-checkbox'}
            onClick={() => setIsPrivate(true)}
          >
            Приватне
          </button>
        </div>

        {isPrivate && (
          <Whitelist whitelist={whitelist} setWhitelist={setWhitelist} />
        )}

        <button type='submit' className='btn-submit' disabled={loading}>
          Створити опитування
        </button>
      </form>

      <ToastContainer
        position='top-right'
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
    </section>
  );
}
