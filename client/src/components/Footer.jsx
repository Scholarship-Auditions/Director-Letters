import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="links-wrapper">
          <h2>Letters</h2>
          <ul className="link-list">
            <li><Link to="/letters/director/Band Director">Band Director Letters</Link></li>
            <li><Link to="/letters/director/Choir Director">Choir Director Letters</Link></li>
            <li><Link to="/letters/director/Orchestra Director">Orchestra Director Letters</Link></li>
            <li><Link to="/letters/director/Musical Theater Director">Musical Theater Director Letters</Link></li>
          </ul>
        </div>
        <div className="links-wrapper">
          <h2>Our Websites</h2>
          <ul className="link-list">
            <li><a href="https://www.nationalscholasticmusiciansawards.com/home" target="_blank" rel="noopener noreferrer">National Scholastic Musician Awards</a></li>
            <li><a href="https://www.mymusicfuture.com/" target="_blank" rel="noopener noreferrer">My Music Future</a></li>
            <li><a href="https://www.accoladi.com/public" target="_blank" rel="noopener noreferrer">Accoladi</a></li>
          </ul>
        </div>
        <div className="links-wrapper">
          <h2>Contact Us</h2>
          <ul className="link-list">
            <li>Phone: +925 825 4700</li>
            <li>Email: example@keth-studio.com</li>
          </ul>
        </div>
        <div className="links-wrapper">
          <h2>Social Links</h2>
          <ul className="social-links">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><li><i className="bi bi-facebook"></i></li></a>
            <a href="https://twitter.com/?lang=en" target="_blank" rel="noopener noreferrer"><li><i className="bi bi-twitter"></i></li></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><li><i className="bi bi-instagram"></i></li></a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"><li><i className="bi bi-linkedin"></i></li></a>
          </ul>
        </div>
      </div>
      <div className="fineprint">
        <p>©2023 All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;