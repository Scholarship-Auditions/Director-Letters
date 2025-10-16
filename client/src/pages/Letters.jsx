import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Letter from '../components/Letter';
import { useAuth } from '../context/AuthContext';

function Letters() {
  const [letters, setLetters] = useState([]);
  const { isAuthenticated } = useAuth();

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
      {isAuthenticated && <Link to="/add-letter">Add New Letter</Link>}
      {letters.map((letter) => (
        <Letter key={letter.letter_id} letter={letter} />
      ))}
    </div>
  );
}

export default Letters;