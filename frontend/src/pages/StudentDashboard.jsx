import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [profile, setProfile] = useState(null);
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [amount, setAmount] = useState(5000); // Default fee amount
  
  const fetchProfile = () => {
    api.get(`/students/profile/${user.id}`)
      .then(res => {
        if (!res.data.nullProfile) {
          setProfile(res.data);
        }
      }).catch(console.error);
  };

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/');
      return;
    }
    fetchProfile();
  }, [navigate]);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students/profile', { userId: user.id, enrollmentNo });
      fetchProfile();
    } catch (error) {
      alert('Failed to create profile');
    }
  };

  const handlePayment = async () => {
    try {
      // Create mock order
      const orderRes = await api.post('/payments/create-order', { amount, userId: user.id });
      const { paymentId } = orderRes.data;

      // Verify mock payment immediately
      await api.post('/payments/verify', { paymentId });
      alert('Payment of ₹' + amount + ' was successful!');
    } catch (error) {
      alert('Payment failed');
    }
  };

  const handleCheckInOut = async (type) => {
    try {
      await api.post('/students/check', { studentProfileId: profile.id, type, remarks: `Student self-${type.toLowerCase().replace('_', '-')}` });
      alert(`Successfully logged ${type.replace('_', ' ')}!`);
    } catch (error) {
      alert('Failed to log action');
    }
  };

  return (
    <div className="app-container">
      <nav className="glass-card flex justify-between items-center" style={{ margin: '24px 32px 0', padding: '16px 24px', borderRadius: '12px' }}>
        <h2 className="text-gradient">Student Portal</h2>
        <button className="btn-secondary" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
      </nav>
      
      <main className="main-content animate-fade-in flex flex-col gap-4">
        <div className="glass-card">
          <h3 className="mb-4 text-gradient">Welcome, {user?.name}!</h3>
          
          {!profile ? (
            <form onSubmit={handleCreateProfile} className="flex items-end gap-4">
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Complete Profile: Enrollment Number</label>
                <input type="text" className="input-field" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)} required placeholder="e.g. ENR123456" />
              </div>
              <button type="submit" className="btn-primary" style={{ height: '46px' }}>Save Profile</button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-muted">Enrollment No: <span style={{ color: 'var(--text-primary)' }}>{profile.enrollmentNo}</span></p>
                <p className="text-muted mt-2">
                  Allocated Room: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                    {profile.room ? profile.room.roomNumber : 'Not Assigned Yet'}
                  </span>
                </p>

                {profile.room && (
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => handleCheckInOut('CHECK_IN')} className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)' }}>
                      Check In
                    </button>
                    <button onClick={() => handleCheckInOut('CHECK_OUT')} className="btn-secondary" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}>
                      Check Out
                    </button>
                  </div>
                )}
              </div>

              <hr style={{ borderColor: 'var(--border-color)', opacity: 0.5, margin: '16px 0' }} />

              <div>
                <h4 className="mb-2">Hostel Fees Payment</h4>
                <p className="text-sm text-muted mb-4">Pay your monthly or semester fees securely using our simulated Razorpay gateway.</p>
                <div className="flex items-end gap-4">
                  <div className="input-group" style={{ marginBottom: 0, width: '200px' }}>
                    <label className="input-label">Amount (₹)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      min="1" 
                      disabled={profile.user?.payments?.some(p => p.status === 'COMPLETED')}
                    />
                  </div>
                  {profile.user?.payments?.some(p => p.status === 'COMPLETED') ? (
                    <button disabled className="btn-secondary" style={{ height: '46px', opacity: 0.7, cursor: 'not-allowed' }}>
                      Paid
                    </button>
                  ) : (
                    <button onClick={handlePayment} className="btn-primary" style={{ height: '46px', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)' }}>
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
