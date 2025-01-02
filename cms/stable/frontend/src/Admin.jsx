import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBell, 
  FaEnvelope,
  FaKey 
} from 'react-icons/fa';

// Import components from Admin_2.jsx
import { 
  Sidebar, 
  DashboardCards, 
  CredentialsModal,
  MobileNavigation 
} from './Admin_2';

function Admin() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  
  // Credential change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Error and success states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Credential change handler
  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation checks
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail && !emailRegex.test(newEmail)) {
      setError('Invalid email format');
      return;
    }

    try {
      // Get token for authorization
      const token = localStorage.getItem('token');

      // Prepare update payload
      const updatePayload = {
        currentPassword,
        newEmail: newEmail || undefined,
        newPassword: newPassword || undefined
      };

      // API call to update credentials
      const response = await axios.post('http://localhost:5000/api/update-credentials', 
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Handle successful update
      setSuccess(response.data.message || 'Credentials updated successfully');
      
      // Reset form fields
      setCurrentPassword('');
      setNewEmail('');
      setNewPassword('');
      setConfirmNewPassword('');

      // Close modal after a short delay
      setTimeout(() => {
        setIsCredentialModalOpen(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      // Handle error
      setError(err.response?.data?.message || 'Failed to update credentials');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          handleLogout={handleLogout} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, Admin</h1>
            <div className="flex items-center space-x-4">
              {/* Change Credentials Button */}
              <button 
                onClick={() => setIsCredentialModalOpen(true)}
                className="btn btn-outline btn-primary mr-2"
              >
                <FaKey className="mr-2" /> Change Credentials
              </button>
              <button className="btn btn-ghost relative">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">3</span>
              </button>
              <button className="btn btn-ghost">
                <FaEnvelope className="text-xl" />
              </button>
            </div>
          </div>

          {/* Dashboard Cards */}
          <DashboardCards />
        </main>
      </div>

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        error={error}
        success={success}
        handleChangeCredentials={handleChangeCredentials}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Admin;
