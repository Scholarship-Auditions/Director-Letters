import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function LetterDetail() {
  const [letter, setLetter] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const response = await api.get(`/api/letters/${id}`);
        setLetter(response.data);
      } catch (error) {
        console.error('Failed to fetch letter:', error);
      }
    };
    fetchLetter();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      try {
        await api.delete(`/api/letters/${id}`);
        navigate('/letters');
      } catch (error) {
        console.error('Failed to delete letter:', error);
      }
    }
  };

  if (!letter) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{letter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: letter.content }} />
      {isAuthenticated && (
        <>
          <Link to={`/letters/${id}/edit`}>Edit</Link>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  );
}

export default LetterDetail;