import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/v1/auth/signup', formData);

            if (response.status === 201) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', formData.username);
                navigate('/');
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'An error occurred. Please try again.');
            } else if (error.request) {
                setError('No response from the server. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: '#F2F2F2', fontFamily: 'Inter, sans-serif' }}
        >
            <div className="bg-white/30 backdrop-blur-xl p-10 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.25)] w-full max-w-md border border-white/40 transition-all">
                <h1 className="text-4xl font-extrabold text-purple-800 mb-6 text-center">Create Account</h1>
                <p className="text-purple-900 text-center mb-6 text-sm">Sign up to get started</p>
                {error && <p className="text-red-600 mb-4 text-center font-medium">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                    <input
                        type="text"
                        placeholder="Username"
                        id="username"
                        onChange={handleChange}
                        value={formData.username}
                        className="p-3 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-500 text-purple-900"
                    />
                    <input
                        type="email"
                        placeholder="Email address"
                        id="email"
                        onChange={handleChange}
                        value={formData.email}
                        className="p-3 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-500 text-purple-900"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        id="password"
                        onChange={handleChange}
                        value={formData.password}
                        className="p-3 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-500 text-purple-900"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-trfrom-purple-600 to-purple-800 text-white py-3 rounded-xl shadow-xl hover:shadow-purple-800/40 transition duration-300 font-semibold tracking-wide"
                    >
                        Sign up
                    </button>
                </form>
                <p className="mt-8 text-center text-purple-900 text-sm">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-purple-700 hover:underline font-semibold">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
