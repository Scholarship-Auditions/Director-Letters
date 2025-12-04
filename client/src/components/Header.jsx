import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    // Placeholder for auth state
    const currentUser = null;

    return (
        <header>
            <ul className="nav">
                <li><Link to="/home">Home</Link></li>
                <li>
                    <Link to="/letters">Letters</Link>
                    <ul className="dropdown">
                        <li><Link to="/band-director-letters">Band Director Letters</Link></li>
                        <li><Link to="/choir-director-letters">Choir Director Letters</Link></li>
                        <li><Link to="/orchestra-director-letters">Orchestra Director Letters</Link></li>
                        <li><Link to="/musical-theater-director-letters">Musical Theater Director Letters</Link></li>
                    </ul>
                </li>
                <li><Link to="/aboutus">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                {currentUser ? (
                    <li><Link to="/logout">Logout</Link></li>
                ) : (
                    <li><Link to="/login">Admin Login</Link></li>
                )}
            </ul>
        </header>
    );
};

export default Header;
