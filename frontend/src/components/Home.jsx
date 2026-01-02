import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button } from './ui';

function Home() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Guest';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/signin');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-alt p-6">
            <Card className="w-full max-w-md text-center">
                <CardContent className="py-12">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl font-bold">{username.charAt(0).toUpperCase()}</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome Back</h1>
                    <p className="text-foreground-muted mb-8 italic">
                        Hello, <span className="font-semibold text-foreground">{username}</span> 👋
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => navigate('/profile')}
                            variant="primary"
                            className="w-full"
                        >
                            View Profile
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="secondary"
                            className="w-full"
                        >
                            Log out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Home;

