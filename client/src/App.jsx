import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Letters from './pages/Letters';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/home-styles.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="home" element={<Home />} />
                    <Route path="letters" element={<Letters title="Letters" />} />
                    <Route path="band-director-letters" element={<Letters title="Band Director Letters" categoryFilter="1" />} />
                    <Route path="choir-director-letters" element={<Letters title="Choir Director Letters" categoryFilter="2" />} />
                    <Route path="orchestra-director-letters" element={<Letters title="Orchestra Director Letters" categoryFilter="3" />} />
                    <Route path="musical-theater-director-letters" element={<Letters title="Musical Theater Director Letters" categoryFilter="4" />} />
                    <Route path="aboutus" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="*" element={<div style={{ padding: '10rem', textAlign: 'center' }}>Page Not Found</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
