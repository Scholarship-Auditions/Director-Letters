import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <ul className="nav">
        <li><Link to="/">Home</Link></li>
        <li>
          <Link to="/letters">Letters</Link>
          <ul className="dropdown">
            <li><Link to="/letters/director/Band Director">Band Director Letters</Link></li>
            <li><Link to="/letters/director/Choir Director">Choir Director Letters</Link></li>
            <li><Link to="/letters/director/Orchestra Director">Orchestra Director Letters</Link></li>
            <li><Link to="/letters/director/Musical Theater Director">Musical Theater Director Letters</Link></li>
          </ul>
        </li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        {isAuthenticated ? (
          <li><a href="#" onClick={handleLogout}>Logout</a></li>
        ) : (
          <li><Link to="/login">Admin Login</Link></li>
        )}
      </ul>
    </header>
  );
}

export default Header;