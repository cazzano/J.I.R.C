import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Admin from './Admin.jsx'
import ModAdmin from './Mod_admin.jsx'
import './index.css'

// JWT Authentication Wrapper
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/" replace />;
  }

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/mod-admin" 
          element={
            <PrivateRoute>
              <ModAdmin />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  </React.StrictMode>,
)
