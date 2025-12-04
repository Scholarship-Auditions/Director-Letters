import React from 'react';

const Register = () => {
    return (
        <div className="container" style={{ marginTop: '10rem', marginBottom: '10rem' }}>
            <h1>Register New Admin</h1>

            <form action="/register" method="POST">
                <div className="form-group">
                    <label htmlFor="username">Email</label>
                    <input type="email" className="form-control" name="username" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" className="form-control" name="password" required />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
