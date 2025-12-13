import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from "aws-amplify/auth";

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await signUp({
                username: email,
                password,
                options: { userAttributes: { email } },
            });

            const { isSignedIn } = await signIn({ username: email, password });

            if (isSignedIn) {
                navigate('/');
            }
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="container" style={{ marginTop: '10rem', marginBottom: '10rem', maxWidth: '500px' }}>
            <h1 className="text-center mb-4">Register New Admin</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter email"
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter password"
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>
        </div>
    );
};

export default Register;
