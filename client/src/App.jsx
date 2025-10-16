import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Letters from './pages/Letters';
import AddLetter from './pages/AddLetter';
import EditLetter from './pages/EditLetter';
import LetterDetail from './pages/LetterDetail';
import DirectorLetters from './pages/DirectorLetters';
import About from './pages/About';
import Contact from './pages/Contact';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import './home-styles.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/letters/director/:directorName" element={<DirectorLetters />} />
            <Route path="/letters/:id" element={<LetterDetail />} />
            <Route path="/letters/:id/edit" element={<EditLetter />} />
            <Route path="/add-letter" element={<AddLetter />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;