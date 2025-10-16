import React from 'react';
import { Link } from 'react-router-dom';

function Letter({ letter }) {
  return (
    <div>
      <h2>
        <Link to={`/letters/${letter.letter_id}`}>{letter.title}</Link>
      </h2>
      <p>From: {letter.writer_name}</p>
      <p>To: {letter.recipient_name}</p>
      <p>Category: {letter.category_name}</p>
    </div>
  );
}

export default Letter;