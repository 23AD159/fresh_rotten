import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(''); // 'farmer' or 'customer'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            🌾 FarmFresh
          </Link>
          
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)}>🛒 Cart</Link>
            <Link to="/market-prices" onClick={() => setIsMenuOpen(false)}>Market Prices</Link>
            <Link to="/weather-insights" onClick={() => setIsMenuOpen(false)}>Weather</Link>
            
            {!isLoggedIn ? (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                {userType === 'farmer' && (
                  <>
                    <Link to="/farmer-dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    <Link to="/upload-product" onClick={() => setIsMenuOpen(false)}>Upload Product</Link>
                    <Link to="/crop-recommendation" onClick={() => setIsMenuOpen(false)}>Crop Advice</Link>
                  </>
                )}
                {userType === 'customer' && (
                  <Link to="/customer-dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                )}
                <Link to="/orders" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              </>
            )}
          </nav>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
