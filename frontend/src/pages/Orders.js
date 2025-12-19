import React, { useState, useEffect } from 'react';

const Orders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statuses = ['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'];

  // Simulated order data
  const mockOrders = [
    { id: 1, product: 'Fresh Tomatoes', customer: 'Rahul Sharma', farmer: 'Rajesh Patel', quantity: '5kg', status: 'Pending', amount: 250, date: '2024-01-15', type: 'farmer', location: 'Mumbai, Maharashtra', paymentStatus: 'Pending' },
    { id: 2, product: 'Organic Spinach', customer: 'Priya Patel', farmer: 'Priya Singh', quantity: '2kg', status: 'Confirmed', amount: 180, date: '2024-01-14', type: 'farmer', location: 'Pune, Maharashtra', paymentStatus: 'Paid' },
    { id: 3, product: 'Green Peas', customer: 'Amit Kumar', farmer: 'Amit Kumar', quantity: '3kg', status: 'Shipped', amount: 120, date: '2024-01-13', type: 'farmer', location: 'Nashik, Maharashtra', paymentStatus: 'Paid' },
    { id: 4, product: 'Sweet Corn', customer: 'Suresh Reddy', farmer: 'Suresh Reddy', quantity: '4kg', status: 'In Transit', amount: 100, date: '2024-01-12', type: 'farmer', location: 'Aurangabad, Maharashtra', paymentStatus: 'Paid' },
    { id: 5, product: 'Fresh Carrots', customer: 'Lakshmi Devi', farmer: 'Lakshmi Devi', quantity: '2.5kg', status: 'Delivered', amount: 75, date: '2024-01-11', type: 'farmer', location: 'Kolhapur, Maharashtra', paymentStatus: 'Paid' },
    { id: 6, product: 'Bananas', customer: 'Ramesh Kumar', farmer: 'Ramesh Kumar', quantity: '2 dozen', status: 'Delivered', amount: 104, date: '2024-01-10', type: 'farmer', location: 'Ratnagiri, Maharashtra', paymentStatus: 'Paid' }
  ];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user);
      
      // Filter orders based on user type
      if (user.userType === 'farmer') {
        setOrders(mockOrders.filter(order => order.farmer === `${user.firstName} ${user.lastName}`));
      } else {
        setOrders(mockOrders.filter(order => order.customer === `${user.firstName} ${user.lastName}`));
      }
    }
  }, []);

  useEffect(() => {
    // Filter orders based on status and search
    let filtered = orders.filter(order => {
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesSearch = order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user?.userType === 'farmer' ? order.customer.toLowerCase().includes(searchTerm.toLowerCase()) : order.farmer.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchTerm, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'Confirmed': return '#17a2b8';
      case 'Processing': return '#6f42c1';
      case 'Shipped': return '#28a745';
      case 'In Transit': return '#fd7e14';
      case 'Delivered': return '#6c757d';
      case 'Cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'Pending').length;
    const confirmed = orders.filter(order => order.status === 'Confirmed').length;
    const delivered = orders.filter(order => order.status === 'Delivered').length;
    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

    return { total, pending, confirmed, delivered, totalAmount };
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            {user?.userType === 'farmer' ? '📋 Order Management' : '📋 My Orders'}
          </h1>
          <p>
            {user?.userType === 'farmer' 
              ? 'Manage incoming orders and track their progress' 
              : 'Track your orders and delivery status'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.totalAmount.toLocaleString()}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Status Filter:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-input"
                  style={{ minWidth: '150px' }}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Search:
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  placeholder={`Search by product or ${user?.userType === 'farmer' ? 'customer' : 'farmer'}...`}
                  style={{ minWidth: '200px' }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                {filteredOrders.length} orders found
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Order Details</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product</th>
                  {user?.userType === 'farmer' ? (
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                  ) : (
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Farmer</th>
                  )}
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Quantity</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Payment</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Date</th>
                  {user?.userType === 'farmer' && (
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#28a745' }}>
                      #{order.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600' }}>{order.product}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{order.location}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {user?.userType === 'farmer' ? order.customer : order.farmer}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{order.quantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>
                      ₹{order.amount}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        backgroundColor: getStatusColor(order.status),
                        color: 'white'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        backgroundColor: getPaymentStatusColor(order.paymentStatus),
                        color: 'white'
                      }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    {user?.userType === 'farmer' && (
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {order.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                              className="btn btn-primary"
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                              className="btn btn-danger"
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {order.status === 'Confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Processing')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            Start Processing
                          </button>
                        )}
                        {order.status === 'Processing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Shipped')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            Ship Order
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'In Transit')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            Mark In Transit
                          </button>
                        )}
                        {order.status === 'In Transit' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
              <p>No orders found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Order Tracking Guide */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">📋 Order Status Guide</h3>
          </div>
          
          <div className="grid grid-4">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <h4 style={{ color: '#ffc107', marginBottom: '0.5rem' }}>Pending</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Order received, awaiting confirmation</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <h4 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>Confirmed</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Order confirmed by farmer</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚚</div>
              <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>In Transit</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Order is on its way</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
              <h4 style={{ color: '#6c757d', marginBottom: '0.5rem' }}>Delivered</h4>
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Order successfully delivered</p>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '1rem', color: '#28a745' }}>About Order Management:</h4>
          <div className="grid grid-2">
            <div>
              <h5 style={{ color: '#495057', marginBottom: '0.5rem' }}>For Farmers:</h5>
              <ul style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                <li>Confirm orders within 24 hours</li>
                <li>Update status as you process orders</li>
                <li>Ensure quality before shipping</li>
                <li>Provide accurate delivery estimates</li>
              </ul>
            </div>
            
            <div>
              <h5 style={{ color: '#495057', marginBottom: '0.5rem' }}>For Customers:</h5>
              <ul style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                <li>Track your order progress</li>
                <li>Contact farmer for any issues</li>
                <li>Rate your experience after delivery</li>
                <li>Report any quality concerns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
