import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div className="footer-container">
                <div className="links-wrapper">
                    <h2>Letters</h2>
                    <ul className="link-list">
                        <li><Link to="/band-director-letters">Band Director Letters</Link></li>
                        <li><Link to="/choir-director-letters">Choir Director Letters</Link></li>
                        <li><Link to="/orchestra-director-letters">Orchestra Director Letters</Link></li>
                        <li><Link to="/musical-theater-director-letters">Musical Theater Director Letters</Link></li>
                    </ul>
                </div>
                <div className="links-wrapper">
                    <h2>Our Websites</h2>
                    <ul className="link-list">
                        <li><a href="https://www.nationalscholasticmusiciansawards.com/home">National Scholastic Musician Awards</a></li>
                        <li><a href="https://www.mymusicfuture.com/">My Music Future</a></li>
                        <li><a href="https://www.accoladi.com/public">Accoladi</a></li>
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
                        <a href="https://www.facebook.com/"><li><i className="bi bi-facebook"></i></li></a>
                        <a href="https://twitter.com/?lang=en"><li><i className="bi bi-twitter"></i></li></a>
                        <a href="https://www.instagram.com/"><li><i className="bi bi-instagram"></i></li></a>
                        <a href="https://www.linkedin.com/"><li><i className="bi bi-linkedin"></i></li></a>
                    </ul>
                </div>
            </div>
            <div className="fineprint">
                <p>©2023 All Rights Reserved</p>
            </div>
        </footer>
    );
};

export default Footer;
