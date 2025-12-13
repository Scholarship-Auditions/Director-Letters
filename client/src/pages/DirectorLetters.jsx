import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dataClient } from "../lib/dataClient";
import Letter from '../components/Letter';

function DirectorLetters() {
  const [letters, setLetters] = useState([]);
  const { directorName } = useParams();

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const { data: writers } = await dataClient.models.LetterWriter.list({
          filter: { name: { eq: directorName } },
        });

        const writer = writers?.[0];
        if (!writer) {
          setLetters([]);
          return;
        }

        const { data } = await dataClient.models.Letter.list({
          filter: { writerId: { eq: writer.id } },
        });

        setLetters(data ?? []);
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
        <Letter key={letter.id} letter={letter} />
      ))}
    </div>
  );
}

export default DirectorLetters;