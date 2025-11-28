import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { currentUser, updateUserProfile, logout, error } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!displayName.trim()) {
      setFormError('Display name cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      await updateUserProfile({ displayName });
      setIsEditing(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          Sign Out
        </button>
      </div>
      
      {(formError || error) && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
          {formError || error}
        </div>
      )}
      
      <div className="flex items-center mb-6">
        <div className="h-20 w-20 rounded-full bg-pink-600 flex items-center justify-center text-2xl font-bold mr-4">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-sm font-medium flex items-center"
                >
                  {isLoading && <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(currentUser.displayName || '');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="text-xl font-semibold">
                {currentUser.displayName || 'User'}
              </h3>
              <p className="text-gray-400">{currentUser.email}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-sm text-pink-500 hover:text-pink-400"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Your Activity</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Broadcasts</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Favorites</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/broadcast')}
              className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 p-3 rounded-lg text-white font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Broadcasting
            </button>
            <button 
              onClick={() => navigate('/favorites')}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              View Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;