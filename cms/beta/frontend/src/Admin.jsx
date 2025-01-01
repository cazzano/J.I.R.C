import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaChartBar, 
  FaProjectDiagram, 
  FaDollarSign, 
  FaBell, 
  FaEnvelope 
} from 'react-icons/fa';

function Admin() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="btn btn-ghost"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, Admin</h1>
            <div className="flex items-center space-x-4">
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
                  <h3 className="text-gray-500 text-sm">Active Projects</h3>
                  <p className="text-2xl font-bold text-primary">56</p>
                </div>
                <FaProjectDiagram className="text-primary/50 text-3xl" />
              </div>
            </div>

            <div className="card bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-sm">Revenue</h3>
                  <p className="text-2xl font-bold text-primary">$45,678</p>
                </div>
                <FaDollarSign className="text-primary/50 text-3xl" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {/* Activity Items */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <FaUser className="mr-3 text-primary" />
                  <span>New user registered</span>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <FaProjectDiagram className="mr-3 text-primary" />
                  <span>Project milestone completed</span>
                </div>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay for Sidebar */}
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
