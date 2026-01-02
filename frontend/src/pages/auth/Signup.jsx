import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button, Input, ErrorBanner } from '../../components/ui';

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
        <div className="min-h-screen flex items-center justify-center px-4 bg-background-alt">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-foreground-muted text-sm">Sign up to get started</p>
                </CardHeader>
                <CardContent>
                    <ErrorBanner message={error} onClose={() => setError('')} />

                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <Input
                            label="Username"
                            type="text"
                            placeholder="johndoe"
                            id="username"
                            onChange={handleChange}
                            value={formData.username}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@company.com"
                            id="email"
                            onChange={handleChange}
                            value={formData.email}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            id="password"
                            onChange={handleChange}
                            value={formData.password}
                        />
                        <Button type="submit" size="lg" className="w-full mt-2">
                            Sign up
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-foreground-muted text-sm border-t pt-6 border-border">
                        Already have an account?{' '}
                        <Link to="/signin" className="text-primary hover:underline font-semibold">
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Signup;


