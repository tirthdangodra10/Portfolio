import React, { useState } from 'react';
import '../../css/Login.css';
import { supabase } from '../../supabaseClient';

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
    // Inputs start blank
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simple Local Authentication (Hardcoded)
        // You can change these values here to update your login credentials
        const ADMIN_EMAIL = "tirth@gmail.com";
        const ADMIN_PASS = "12345678";

        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            // Simulate network delay for effect
            setTimeout(() => {
                setLoading(false);
                if (onLoginSuccess) onLoginSuccess();
                alert("Welcome back, Tirth!");
            }, 800);
        } else {
            setLoading(false);
            alert("Invalid login credentials");
        }
    };

    return (
        <div className="login-modal-overlay">
            <div className="login-modal">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ color: '#ffffff', backgroundColor: '#222', border: '1px solid #444' }}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ color: '#ffffff', backgroundColor: '#222', border: '1px solid #444' }}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Verifying..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
