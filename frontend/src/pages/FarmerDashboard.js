import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 24,
    activeOrders: 8,
    monthlyRevenue: 45000,
    qualityScore: 95
  });
  const [recentOrders, setRecentOrders] = useState([
    { id: 1, customer: 'Rahul Sharma', product: 'Fresh Tomatoes', quantity: '5kg', status: 'Pending', amount: 250 },
    { id: 2, customer: 'Priya Patel', product: 'Organic Spinach', quantity: '2kg', status: 'Confirmed', amount: 180 },
    { id: 3, customer: 'Amit Kumar', product: 'Green Peas', quantity: '3kg', status: 'Shipped', amount: 120 }
  ]);
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    forecast: 'Good for farming activities'
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'Confirmed': return '#17a2b8';
      case 'Shipped': return '#28a745';
      case 'Delivered': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {user.firstName}! 👨‍🌾</h1>
          <p>Manage your farm products, track orders, and get insights for better farming decisions</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.activeOrders}</div>
            <div className="stat-label">Active Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <div className="stat-label">Monthly Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.qualityScore}%</div>
            <div className="stat-label">Quality Score</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-2">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
              <Link to="/orders" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                View All
              </Link>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ 
                  padding: '1rem', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>{order.customer}</strong>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    {order.product} - {order.quantity}
                  </div>
                  <div style={{ color: '#28a745', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    ₹{order.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Widget */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Weather Insights</h3>
              <Link to="/weather-insights" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                Details
              </Link>
            </div>
            
            <div className="weather-widget">
              <div className="weather-temp">{weatherData.temperature}°C</div>
              <div className="weather-desc">{weatherData.condition}</div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Humidity:</strong> {weatherData.humidity}%
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {weatherData.forecast}
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#28a745' }}>Farming Recommendations:</h4>
              <ul style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                <li>Good time for irrigation</li>
                <li>Monitor for pest activity</li>
                <li>Harvest early morning for freshness</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          
          <div className="grid grid-4">
            <Link to="/upload-product" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📤</div>
              <h4 style={{ color: '#28a745' }}>Upload Product</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Add new products with AI quality check</p>
            </Link>
            
            <Link to="/crop-recommendation" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌾</div>
              <h4 style={{ color: '#28a745' }}>Crop Advice</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Get personalized crop recommendations</p>
            </Link>
            
            <Link to="/market-prices" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
              <h4 style={{ color: '#28a745' }}>Market Prices</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Check real-time market rates</p>
            </Link>
            
            <Link to="/orders" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <h4 style={{ color: '#28a745' }}>Manage Orders</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Process and track all orders</p>
            </Link>
          </div>
        </div>

        {/* Farm Information */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Farm Information</h3>
          </div>
          
          <div className="grid grid-3">
            <div>
              <strong>Farm Name:</strong> {user.farmName || 'Not specified'}
            </div>
            <div>
              <strong>Farm Size:</strong> {user.farmSize || 'Not specified'} acres
            </div>
            <div>
              <strong>Soil Type:</strong> {user.soilType || 'Not specified'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
