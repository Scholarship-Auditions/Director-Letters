import React from 'react';

function Letter({ letter }) {
  return (
    <div>
      <h2>{letter.title}</h2>
      <p>From: {letter.writer_name}</p>
      <p>To: {letter.recipient_name}</p>
      <p>Category: {letter.category_name}</p>
      <div dangerouslySetInnerHTML={{ __html: letter.content }} />
    </div>
  );
}

export default Letter;