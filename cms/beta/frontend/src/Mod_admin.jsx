import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faKey, 
  faEnvelope, 
  faSave 
} from '@fortawesome/free-solid-svg-icons';

function ModAdmin() {
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    
    // Reset previous messages
    setMessage('');
    setError('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/update-credentials', {
        current_email: currentEmail,
        current_password: currentPassword,
        new_email: newEmail,
        new_password: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMessage('Credentials updated successfully');
        // Clear form
        setCurrentEmail('');
        setCurrentPassword('');
        setNewEmail('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Update Credentials
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4">
          {/* Current Email Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Email
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="absolute left-3 text-gray-400" 
              />
              <input 
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter current email"
                required
              />
            </div>
          </div>

          {/* Current Password Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={faKey} 
                className="absolute left-3 text-gray-400" 
              />
              <input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter current password"
                required
              />
            </div>
          </div>

          {/* New Email Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Email
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="absolute left-3 text-gray-400" 
              />
              <input 
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter new email"
                required
              />
            </div>
          </div>

          {/* New Password Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={faKey} 
                className="absolute left-3 text-gray-400" 
              />
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter new password"
                required
              />
            </div>
          </div>

          {/* Confirm New Password Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={faKey} 
                className="absolute left-3 text-gray-400" 
              />
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-600 transition flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Update Credentials
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModAdmin;
