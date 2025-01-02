import React from 'react';
import { 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaChartBar, 
  FaProjectDiagram, 
  FaDollarSign 
} from 'react-icons/fa';

// Sidebar Component
export function Sidebar({ isSidebarOpen, handleLogout }) {
  return (
    <div className={`
      fixed md:static z-50 md:z-0 
      w-64 bg-white shadow-xl 
      transform transition-transform duration-300 
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 h-full
    `}>
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
      </div>
      
      <nav className="p-4 space-y-2">
        <a href="#" className="flex items-center p-3 hover:bg-primary/10 rounded-lg transition">
          <FaHome className="mr-3 text-primary" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="flex items-center p-3 hover:bg-primary/10 rounded-lg transition">
          <FaUser className="mr-3 text-primary" />
          <span>Profile</span>
        </a>
        <a href="#" className="flex items-center p-3 hover:bg-primary/10 rounded-lg transition">
          <FaChartBar className="mr-3 text-primary" />
          <span>Analytics</span>
        </a>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center p-3 hover:bg-red-50 rounded-lg transition text-red-500"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}

// Dashboard Cards Component
export function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-2xl font-bold text-primary">1,234</p>
          </div>
          <FaUser className="text-primary/50 text-3xl" />
        </div>
      </div>

      <div className="card bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 text-sm">Total Revenue</h3>
            <p className="text-2xl font-bold text-primary">$12,345</p>
          </div>
          <FaDollarSign className="text-primary/50 text-3xl" />
        </div>
      </div>

      <div className="card bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 text-sm">Pending Orders</h3>
            <p className="text-2xl font-bold text-primary">45</p>
          </div>
          <FaProjectDiagram className="text-primary/50 text-3xl" />
        </div>
      </div>
    </div>
  );
}

// Credentials Modal Component
export function CredentialsModal({
  isOpen,
  onClose,
  currentPassword,
  setCurrentPassword,
  newEmail,
  setNewEmail,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  error,
  success,
  handleChangeCredentials
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Change Credentials</h2>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleChangeCredentials} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block mb-2 font-medium">Current Password</label>
            <input 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter current password"
              required
            />
          </div>

          {/* New Email */}
          <div>
            <label className="block mb-2 font-medium">New Email (Optional)</label>
            <input 
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter new email (optional)"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block mb-2 font-medium">New Password (Optional)</label>
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter new password (optional)"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block mb-2 font-medium">Confirm New Password</label>
            <input 
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Confirm new password"
              disabled={!newPassword}
            />
          </div>

          {/* Update Button */}
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-600 transition-colors"
            disabled={!currentPassword}
          >
            Update Credentials
          </button>
        </form>

        {/* Cancel Button */}
        <button 
          onClick={onClose} 
          className="mt-4 w-full text-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Mobile Navigation Component
export function MobileNavigation({ isSidebarOpen, setIsSidebarOpen }) {
  return (
    <div className="md:hidden bg-primary text- white p-4 flex justify-between items-center">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <span className="text-xl">{isSidebarOpen ? 'Close' : 'Menu'}</span>
      </button>
      <h1 className="text-lg font-bold">Admin</h1>
    </div>
  );
}
