import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Letters = ({ title, categoryFilter }) => {
    // Mock data for letters and categories since we don't have a backend yet
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '');

    // Placeholder for auth state
    const currentUser = null;

    const lettercategories = [
        { id: 1, name: 'Band' },
        { id: 2, name: 'Choir' },
        { id: 3, name: 'Orchestra' },
        { id: 4, name: 'Musical Theater' },
    ];

    const allLetters = [
        { id: 1, title: 'Welcome Back Letter', content: 'Welcome back to a new school year...', writerName: 'John Doe', recipientName: 'Parents', categoryName: 'Band', categoryId: 1 },
        { id: 2, title: 'Concert Invitation', content: 'You are invited to our winter concert...', writerName: 'Jane Smith', recipientName: 'Community', categoryName: 'Choir', categoryId: 2 },
        // Add more mock data as needed
    ];

    const filteredLetters = allLetters.filter(letter => {
        const matchesSearch = letter.title.toLowerCase().includes(searchQuery.toLowerCase()) || letter.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? letter.categoryId === parseInt(selectedCategory) : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <main className="letters-container">
            <section className="letters-hero">
                <h1 className="letters-hero-title">{title}</h1>
            </section>

            <section className="letters-section">
                <div className="letter-type">
                    <h2>List of {title}</h2>
                    {currentUser && (
                        <Link to="/add-letter" className="btn btn-primary" style={{ marginBottom: '20px' }}>Add New Letter</Link>
                    )}
                    <div className="search-form">
                        <input
                            type="text"
                            placeholder="Search letters"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {lettercategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => { }}>Search</button>
                    </div>
                    <div className="letters">
                        {filteredLetters.length > 0 ? (
                            filteredLetters.map((letter) => (
                                <div className="letter" key={letter.id}>
                                    <h3>{letter.title}</h3>
                                    <p>{letter.content}</p>
                                    <h5>Writer: {letter.writerName}</h5>
                                    <h5>For: {letter.recipientName}</h5>
                                    <h5>Category {letter.categoryName}</h5>
                                    {currentUser ? (
                                        <Link to={`/letters/${letter.id}`} className="btn btn-primary">View Actions</Link>
                                    ) : (
                                        <Link to={`/view-docx/${letter.id}`} className="btn btn-primary">Download</Link>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No letters found.</p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Letters;
