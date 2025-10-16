import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Letter from '../components/Letter';

function DirectorLetters() {
  const [letters, setLetters] = useState([]);
  const { directorName } = useParams();

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await api.get(`/api/letters/director/${directorName}`);
        setLetters(response.data);
      } catch (error) {
        console.error(`Failed to fetch letters for ${directorName}:`, error);
      }
    };
    fetchLetters();
  }, [directorName]);

  return (
    <div>
      <h1>{directorName} Letters</h1>
      {letters.map((letter) => (
        <Letter key={letter.letter_id} letter={letter} />
      ))}
    </div>
  );
}

export default DirectorLetters;