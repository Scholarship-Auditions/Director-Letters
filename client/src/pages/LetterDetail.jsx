import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authModes, dataClient, buildSignedLetterUrl } from "../lib/dataClient";

function LetterDetail() {
  const [letter, setLetter] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const { data } = await dataClient.models.Letter.get({ id });
        if (!data) {
          setLetter(null);
          return;
        }

        const s3Url = await buildSignedLetterUrl(data.s3Key);

        setLetter({ ...data, s3_url: s3Url });
      } catch (error) {
        console.error('Failed to fetch letter:', error);
      }
    };
    fetchLetter();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      try {
        await dataClient.models.Letter.delete({ id }, authModes.write);
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
      {letter.s3_url && (
        <p>
          <a href={letter.s3_url} download>
            Download original HTML
          </a>
        </p>
      )}
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