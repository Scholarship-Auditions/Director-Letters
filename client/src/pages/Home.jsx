import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/letters">View Letters</Link>
      <br />
      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Home;