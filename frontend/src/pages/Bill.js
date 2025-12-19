import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Bill = () => {
  const [orderData, setOrderData] = useState(null);
  const billRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    } else {
      navigate('/products');
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${orderData?.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${billRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!orderData) {
    return null;
  }

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="dashboard-title">📄 Invoice</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleDownload}>
              📥 Download
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="card" ref={billRef} style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e9ecef' }}>
            <h2 style={{ color: '#28a745', marginBottom: '0.5rem' }}>🌾 FarmFresh</h2>
            <p style={{ color: '#6c757d', margin: 0 }}>Fresh Farm Products</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Bill To:</h4>
              <p style={{ margin: '0.25rem 0' }}><strong>{orderData.customerInfo.name}</strong></p>
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>{orderData.customerInfo.email}</p>
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>{orderData.customerInfo.phone}</p>
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>{orderData.customerInfo.address}</p>
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                {orderData.customerInfo.city} - {orderData.customerInfo.pincode}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Order Details:</h4>
              <p style={{ margin: '0.25rem 0' }}><strong>Order ID:</strong> {orderData.orderId}</p>
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                <strong>Date:</strong> {new Date(orderData.orderDate).toLocaleDateString()}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                <strong>Time:</strong> {new Date(orderData.orderDate).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderData.cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{item.image}</span>
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          by {item.farmer} • {item.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '2px solid #e9ecef', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>₹{orderData.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #e9ecef', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total Amount:</span>
              <span style={{ color: '#28a745' }}>₹{orderData.total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef', textAlign: 'center', color: '#6c757d', fontSize: '0.9rem' }}>
            <p>Thank you for your purchase! 🎉</p>
            <p>Your order will be delivered soon.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .card, .card * {
            visibility: visible;
          }
          .card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Bill;
