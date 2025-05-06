import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ethers } from 'ethers';
import { PollContractABI, PollContractAddress } from '../constant/constant.js';
import checkMark from '/checkMark.png';
import './ListPoll.css';

export default function ListPoll() {
  const [polls, setPolls] = useState([]);
  const [start, setStart] = useState(0);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    getPolls(start);
  }, []);

  async function getPolls(startIndex) {
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);
      const signer = web3Provider.getSigner();

      const contractInstance = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      const [ids, questions] = await contractInstance.getAllPolls(
        startIndex,
        limit
      );

      if (ids.length === 0) {
        setHasMore(false);
        return;
      }

      const formattedPolls = await Promise.all(
        ids.map(async (id, index) => {
          const hasVoted = await contractInstance.hasVoted(id);
          return {
            id: id.toString(),
            question: questions[index],
            hasVoted,
          };
        })
      );

      setPolls((prevPolls) => [...prevPolls, ...formattedPolls]);
      setStart((prevStart) => prevStart + ids.length);
    } catch (error) {
      console.error('Помилка при отриманні опитувань:', error);
    }
  }

  return (
    <section>
      <ul>
        {polls.map((poll) => (
          <NavLink to={`/poll/${poll.id}`} className='poll-card' key={poll.id}>
            {poll.hasVoted ? (
              <button className='btn-poll-card'>
                <strong>ID {poll.id}:</strong> {poll.question} &nbsp;
                <img src={checkMark} alt='checkMark' className='check-mark' />
              </button>
            ) : (
              <button className='btn-poll-card'>
                <strong>ID {poll.id}:</strong> {poll.question}
              </button>
            )}
          </NavLink>
        ))}
      </ul>

      {hasMore && (
        <div className='load-more-container'>
          <button className='btn-load-more' onClick={() => getPolls(start)}>
            Завантажити ще
          </button>
        </div>
      )}
    </section>
  );
}
