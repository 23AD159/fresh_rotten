import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>🌾 FarmFresh</h3>
                        <p>Connecting farmers directly to consumers with AI-powered quality assurance and real-time market insights.</p>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/market-prices">Market Prices</Link></li>
                            <li><Link to="/weather-insights">Weather Insights</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>For Farmers</h3>
                        <ul>
                            <li><Link to="/farmer-dashboard">Dashboard</Link></li>
                            <li><Link to="/upload-product">Upload Products</Link></li>
                            <li><Link to="/crop-recommendation">Crop Advice</Link></li>
                            <li><Link to="/orders">Order Management</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>For Customers</h3>
                        <ul>
                            <li><Link to="/customer-dashboard">Dashboard</Link></li>
                            <li><Link to="/products">Browse Products</Link></li>
                            <li><Link to="/orders">Track Orders</Link></li>
                            <li><Link to="/market-prices">Price Comparison</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Contact</h3>
                        <ul>
                            <li>📧 support@farmfresh.com</li>
                            <li>📞 +91 98765 43210</li>
                            <li>📍 Maharashtra, India</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 FarmFresh. All rights reserved. | AI-Powered Farm-to-Consumer Platform</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
