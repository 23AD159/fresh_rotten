import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, simulate successful login
      if (formData.email && formData.password) {
        // Store user info in localStorage (in real app, use proper auth)
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          userType: formData.userType,
          isLoggedIn: true
        }));
        
        // Redirect based on user type
        if (formData.userType === 'farmer') {
          navigate('/farmer-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ textAlign: 'center' }}>Welcome Back</h2>
              <p style={{ textAlign: 'center', color: '#6c757d' }}>
                Sign in to your FarmFresh account
              </p>
            </div>

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">User Type</label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="customer">Customer</option>
                  <option value="farmer">Farmer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: '#6c757d' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#28a745', textDecoration: 'none' }}>
                  Sign up here
                </Link>
              </p>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '1rem', color: '#28a745' }}>Demo Credentials:</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                <strong>Email:</strong> demo@farmfresh.com<br/>
                <strong>Password:</strong> demo123<br/>
                <strong>Note:</strong> Use any email/password combination to test the demo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
