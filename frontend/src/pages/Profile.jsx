import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { PollContractABI, PollContractAddress } from '../constant/constant.js';
import { NavLink } from 'react-router-dom';

export default function Profile() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    getOwnerPoll();
  }, []);

  async function getOwnerPoll() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        PollContractAddress,
        PollContractABI,
        signer
      );

      const [ids, questions] = await contract.getOwnerPoll();

      if (ids.length === 0) {
        setPolls([]);
        return;
      }

      const formattedPolls = await Promise.all(
        ids.map(async (id, index) => {
          return {
            id: id.toString(),
            question: questions[index],
          };
        })
      );

      setPolls(formattedPolls);
    } catch (error) {
      console.error('Помилка при отриманні опитувань:', error);
    }
  }

  return (
    <section>
      <h1>Ваші опитування</h1>
      <ul>
        {polls.map((poll) => (
          <NavLink to={`/poll/${poll.id}`} className='poll-card' key={poll.id}>
            <button className='btn-poll-card'>
              <strong>ID {poll.id}:</strong> {poll.question} &nbsp;
            </button>
          </NavLink>
        ))}
      </ul>
    </section>
  );
}
