import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Poll.css';
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { PollContractABI, PollContractAddress } from '../constant/constant.js';
import Whitelist from '../components/Whitelist.jsx';
import DeleteFromWhitelist from '../components/DeleteFromWhitelist.jsx';

export default function Poll() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [whitelist, setWhitelist] = useState(['']);

  useEffect(() => {
    getPoll();
  }, [id]);

  async function getPoll() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      const [pollId, question, options, isowner, isprivate, votes] =
        await contract.getPoll(id);
      const voted = await contract.hasVoted(id);
      const isactive = await contract.getPollIsActive(id);

      setPoll({
        id: pollId.toString(),
        question,
        options,
        isowner,
        isprivate,
        isactive,
        votes: votes.map((v) => v.toString()),
      });

      setHasVoted(voted);
    } catch (error) {
      console.error('Помилка при отриманні опитування:', error);
    }
  }

  async function handleVoteSubmit(e) {
    e.preventDefault();

    if (selectedOption === null) {
      toast.warn('Будь ласка, оберіть варіант відповіді!');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info('Виконується голосування...');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      const tx = await contract.vote(poll.id, selectedOption);
      await tx.wait();

      toast.success('Голос успішно враховано!');
      setHasVoted(true);
      getPoll();
    } catch (error) {
      console.error('Помилка при голосуванні:', error);
      toast.error(`Помилка: ${error.reason || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddToWhitelist(addresses) {
    if (addresses.length === 0) {
      toast.warning('Список адрес порожній');
      return;
    }

    if (addresses.length > 100) {
      toast.warning('Максимум 100 адрес одночасно');
      return;
    }

    const invalid = addresses.find((addr) => !isAddress(addr));
    if (invalid) {
      toast.error(`Невірна адреса: ${invalid}`);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      toast.info('Додавання до whitelist...');
      const tx = await contract.addToWhitelist(poll.id, addresses);
      await tx.wait();

      toast.success('Адреси успішно додано до whitelist!');
      setWhitelist(['']);
    } catch (error) {
      console.error('Помилка при додаванні до whitelist:', error);
      toast.error(error.reason || 'Не вдалося додати адреси до whitelist');
    }
  }

  async function handleClosePoll() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      toast.info('Закриття опитування...');
      const tx = await contract.closePoll(poll.id);
      await tx.wait();

      toast.success('Опитування закрито!');
      getPoll();
    } catch (error) {
      console.error('Помилка при закритті опитування:', error);
      toast.error(error.reason || 'Не вдалося закрити опитування');
    }
  }

  if (!poll) return <p>Завантаження...</p>;

  return (
    <section>
      <h3>Опитування ID: {poll.id}</h3>

      {hasVoted ? (
        <>
          <form className='poll-form' onSubmit={handleVoteSubmit}>
            <h2>{poll.question}</h2>
            <div id='poll-form'>
              {poll.options.map((option, index) => (
                <label key={index} className='poll-option'>
                  <input
                    type='radio'
                    name='pollOption'
                    value={index}
                    onChange={() => setSelectedOption(index)}
                    className='form-radio text-blue-600'
                  />
                  <span className='font-medium'>{option}</span>
                </label>
              ))}
            </div>

            <div className='btn-wrapper'>
              <p className='already-voted'>
                Ви вже голосували в цьому опитуванні ✅
              </p>
            </div>
          </form>

          <h4>Поточні голоси:</h4>
          <ul>
            {poll.options.map((option, index) => (
              <li key={index}>
                {option} — {poll.votes[index]} голосів
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <form className='poll-form' onSubmit={handleVoteSubmit}>
            <h2>{poll.question}</h2>
            <div id='poll-form'>
              {poll.options.map((option, index) => (
                <label key={index} className='poll-option'>
                  <input
                    type='radio'
                    name='pollOption'
                    value={index}
                    onChange={() => setSelectedOption(index)}
                    className='form-radio text-blue-600'
                  />
                  <span className='font-medium'>{option}</span>
                </label>
              ))}
            </div>

            <div className='btn-wrapper'>
              {!poll.isactive ? (
                <p className='already-voted'>Опитування завершено ❌</p>
              ) : (
                <button
                  className='btn-submit-vote'
                  type='submit'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Голосування...' : 'Підтвердити'}
                </button>
              )}
            </div>
          </form>

          {poll.isowner && poll.isprivate && poll.isactive ? (
            <>
              <form>
                <Whitelist
                  whitelist={whitelist}
                  setWhitelist={setWhitelist}
                  onAddToWhitelist={handleAddToWhitelist}
                />
                <DeleteFromWhitelist pollId={poll.id} />
              </form>
            </>
          ) : null}

          {poll.isowner ? (
            <>
              <h4>Поточні голоси:</h4>
              <ul>
                {poll.options.map((option, index) => (
                  <li key={index}>
                    {option} — {poll.votes[index]} голосів
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {poll.isowner && poll.isactive ? (
            <div className='btn-wrapper'>
              <button
                className='btn-close-poll'
                onClick={handleClosePoll}
                disabled={!poll.isactive}
              >
                Закрити опитування
              </button>
            </div>
          ) : null}
        </>
      )}
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
