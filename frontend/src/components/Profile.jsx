import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Button } from './ui';
import { useAuth } from '../context/AuthContext';
import { MapPin, Store, ExternalLink } from 'lucide-react'; // Added icons for better UI

const Profile = () => {
  const { logout, token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(response.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-alt">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-foreground-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-alt p-4">
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  // Data mapping matching your new nested Schema structure
  const displayUser = {
    username: userData?.username || "User",
    email: userData?.email || "No email",
    role: userData?.role || "user",
    storeName: userData?.storeName,
    // Accessing the new nested location object
    address: userData?.location?.address || "Address not set",
    coordinates: userData?.location?.coordinates || null,
    picture: `https://ui-avatars.com/api/?name=${userData?.username || 'U'}&background=0D9488&color=fff`
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <img
            src={displayUser.picture}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-sm"
          />

          <h2 className="text-2xl font-bold text-foreground capitalize">
            {displayUser.username}
          </h2>
          <p className="text-foreground-muted mb-4">{displayUser.email}</p>

          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6 uppercase tracking-wider">
            {displayUser.role}
          </div>

          {/* Extra Vendor Fields */}
          {displayUser.role === 'vendor' && (
            <div className="text-left bg-gray-50 border border-border rounded-xl p-5 mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <label className="text-[10px] uppercase font-bold text-foreground-muted block">Store Name</label>
                  <p className="text-sm font-semibold text-foreground">{displayUser.storeName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-foreground-muted block">Location</label>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {displayUser.address}
                  </p>

                  {/* Google Maps Link using Coordinates */}
                  {displayUser.coordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${displayUser.coordinates}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-2 font-bold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6 mt-2">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
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