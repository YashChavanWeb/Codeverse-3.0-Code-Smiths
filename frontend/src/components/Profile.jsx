import React from 'react';
import { Card, CardContent, Button } from './ui';

const Profile = ({ user, onLogout }) => {
  // Fallback for user data if not provided
  const userData = user || {
    name: localStorage.getItem('username') || 'User',
    email: 'user@example.com',
    picture: 'https://via.placeholder.com/150'
  };

  const handleLogout = onLogout || (() => {
    localStorage.clear();
    window.location.href = '/signin';
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8">
          <img
            src={userData.picture}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-background shadow-sm"
          />
          <h2 className="text-2xl font-bold mb-1">{userData.name}</h2>
          <p className="text-foreground-muted mb-6">{userData.email}</p>
          <div className="border-t border-border pt-6 mt-2">
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full text-error"
            >
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;


