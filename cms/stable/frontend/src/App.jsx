import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './Env';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Log environment variables on component mount
  useEffect(() => {
    console.log('Environment Variables in App:');
    console.log('Username:', import.meta.env.VITE_USERNAME);
    console.log('Password:', import.meta.env.VITE_PASSWORD);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Extensive Logging
    console.log('Login Attempt Details:');
    console.log('Raw Email:', email);
    console.log('Raw Password:', password);

    // Trim and normalize email
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log('Trimmed Email:', trimmedEmail);
    console.log('Trimmed Password:', trimmedPassword);

    // Expected credentials from environment
    const expectedUsername = import.meta.env.VITE_USERNAME?.trim().toLowerCase();
    const expectedPassword = import.meta.env.VITE_PASSWORD?.trim();

    console.log('Expected Username:', expectedUsername);
    console.log('Expected Password:', expectedPassword);

    try {
      // Detailed credential check
      if (!trimmedEmail) {
        setError('Email cannot be empty');
        return;
      }

      if (!trimmedPassword) {
        setError('Password cannot be empty');
        return;
      }

      // Perform login
      const success = login(trimmedEmail, trimmedPassword);
      
      if (!success) {
        setError('Invalid credentials. Please try again.');
        console.error('Login Failed');
        
        // Detailed mismatch logging
        console.log('Email Mismatch:', trimmedEmail !== expectedUsername);
        console.log('Password Mismatch:', trimmedPassword !== expectedPassword);
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Sign In
            </h2>
            <p className="text-sm text-gray-500">
              Continue to your admin dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative transition-all duration-300 ease-in-out" 
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="text-gray-400" 
                />
              </div>
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(''); // Clear error when typing
                }}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="text-gray-400" 
                />
              </div>
              <input 
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Password" 
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Clear error when typing
                }}
                required
                autoComplete="current-password"
              />
              <button 
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon 
                  icon={isPasswordVisible ? faEyeSlash : faEye} 
                />
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-between items-center">
              <a 
                href="#" 
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Don't have an account? {' '}
              <a href="#" className="text-primary hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
