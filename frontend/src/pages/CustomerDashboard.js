import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([
    { id: 1, product: 'Fresh Tomatoes', farmer: 'Rajesh Patel', quantity: '2kg', status: 'Delivered', amount: 100, date: '2024-01-10' },
    { id: 2, product: 'Organic Spinach', farmer: 'Priya Singh', quantity: '1kg', status: 'In Transit', amount: 80, date: '2024-01-12' },
    { id: 3, product: 'Green Peas', farmer: 'Amit Kumar', quantity: '1.5kg', status: 'Processing', amount: 60, date: '2024-01-14' }
  ]);
  const [recommendedProducts, setRecommendedProducts] = useState([
    { id: 1, name: 'Fresh Tomatoes', price: 35, unit: 'kg', farmer: 'Rajesh Patel', rating: 4.8, image: '🍅' },
    { id: 2, name: 'Organic Spinach', price: 40, unit: 'kg', farmer: 'Priya Singh', rating: 4.9, image: '🥬' },
    { id: 3, name: 'Sweet Corn', price: 25, unit: 'kg', farmer: 'Suresh Reddy', rating: 4.7, image: '🌽' },
    { id: 4, name: 'Fresh Carrots', price: 30, unit: 'kg', farmer: 'Lakshmi Devi', rating: 4.6, image: '🥕' }
  ]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return '#ffc107';
      case 'In Transit': return '#17a2b8';
      case 'Delivered': return '#28a745';
      case 'Cancelled': return '#dc3545';
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
          <h1 className="dashboard-title">Welcome back, {user.firstName}! 🛒</h1>
          <p>Discover fresh farm products and track your orders</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{recentOrders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {recentOrders.filter(order => order.status === 'Delivered').length}
            </div>
            <div className="stat-label">Completed Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {recentOrders.filter(order => order.status === 'In Transit').length}
            </div>
            <div className="stat-label">In Transit</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              ₹{recentOrders.reduce((total, order) => total + order.amount, 0).toLocaleString()}
            </div>
            <div className="stat-label">Total Spent</div>
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
                    <strong>{order.product}</strong>
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
                    Farmer: {order.farmer} | {order.quantity}
                  </div>
                  <div style={{ color: '#28a745', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    ₹{order.amount} | {order.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Products */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recommended for You</h3>
              <Link to="/products" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                Browse All
              </Link>
            </div>
            
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              {recommendedProducts.map(product => (
                <div key={product.id} className="product-card" style={{ margin: 0 }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    textAlign: 'center', 
                    padding: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    {product.image}
                  </div>
                  <div className="product-info" style={{ padding: '1rem' }}>
                    <div className="product-title">{product.name}</div>
                    <div className="product-price">₹{product.price}/{product.unit}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                      by {product.farmer}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#ffc107' }}>
                      ⭐ {product.rating}/5.0
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          
          <div className="grid grid-4">
            <Link to="/products" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛒</div>
              <h4 style={{ color: '#28a745' }}>Shop Products</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Browse fresh farm produce</p>
            </Link>
            
            <Link to="/orders" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <h4 style={{ color: '#28a745' }}>Track Orders</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Monitor your deliveries</p>
            </Link>
            
            <Link to="/market-prices" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
              <h4 style={{ color: '#28a745' }}>Market Prices</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Check current rates</p>
            </Link>
            
            <Link to="/weather-insights" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌤️</div>
              <h4 style={{ color: '#28a745' }}>Weather</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Farming insights</p>
            </Link>
          </div>
        </div>

        {/* Customer Information */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Customer Information</h3>
          </div>
          
          <div className="grid grid-3">
            <div>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Phone:</strong> {user.phone || 'Not specified'}
            </div>
            <div>
              <strong>Address:</strong> {user.address || 'Not specified'}
            </div>
            <div>
              <strong>Member Since:</strong> January 2024
            </div>
            <div>
              <strong>Total Orders:</strong> {recentOrders.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
