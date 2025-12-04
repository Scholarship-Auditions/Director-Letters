import React from 'react';

const Placeholder = ({ title }) => {
    return (
        <div className="container" style={{ padding: '10rem 2rem', textAlign: 'center' }}>
            <h1>{title}</h1>
            <p>This page is under construction.</p>
        </div>
    );
};

export default Placeholder;
