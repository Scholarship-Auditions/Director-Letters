import React from 'react';
import { Link } from 'react-router-dom';

function Letter({ letter }) {
  return (
    <div>
      <h2>
        <Link to={`/letters/${letter.id}`}>{letter.title}</Link>
      </h2>
      <p>From: {letter.writerName}</p>
      <p>To: {letter.recipientName}</p>
      <p>Category: {letter.categoryName}</p>
    </div>
  );
}

export default Letter;