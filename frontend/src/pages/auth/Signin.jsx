import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent, Button, Input, ErrorBanner } from '../../components/ui';

function Signin() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/v1/auth/signin', formData);
            if (response.status === 200) {
                const { token, username } = response.data;
                localStorage.setItem('token', token);
                if (username) localStorage.setItem('username', username);
                navigate('/');
            }
        } catch (err) {
            if (err.response) setError(err.response.data.message || 'Something went wrong.');
            else if (err.request) setError('No response from server.');
            else setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background-alt">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-foreground-muted text-sm">Sign in to access your account</p>
                </CardHeader>
                <CardContent>
                    <ErrorBanner message={error} onClose={() => setError('')} />
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                            Sign in
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-foreground-muted text-sm border-t pt-6 border-border">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline font-semibold">
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Signin;
