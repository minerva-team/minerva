import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function UserAvatar() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch('http://localhost:8000/api/hr/employees/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile avatar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-[#1c1c1e] border border-white/5"></div>;
  }

  return (
    <div className="relative inline-block transition-transform active:scale-95">
        {profileData?.profile_picture ? (
        <img
          src={profileData.profile_picture}
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover border border-white/10 shadow-md ring-2 ring-transparent transition-all duration-300 hover:ring-purple-500/50"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-purple-600 to-blue-500 text-white shadow-md ring-2 ring-transparent transition-all duration-300 hover:ring-purple-500/50">
          <span className="text-sm font-semibold tracking-wider">
            {profileData?.first_name ? profileData.first_name.charAt(0).toUpperCase() : <User size={18} />}
          </span>
        </div>
      )}
      
      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#121212]"></span>
    </div>
  );
}