import React, { useState, useEffect } from 'react';
import api from '../api';
import Letter from '../components/Letter';

function Letters() {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await api.get('/api/letters');
        setLetters(response.data);
      } catch (error) {
        console.error('Failed to fetch letters:', error);
      }
    };
    fetchLetters();
  }, []);

  return (
    <div>
      <h1>Letters</h1>
      {letters.map((letter) => (
        <Letter key={letter.letter_id} letter={letter} />
      ))}
    </div>
  );
}

export default Letters;