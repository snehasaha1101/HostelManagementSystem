import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'ADMIN') navigate('/admin');
      else navigate('/student');
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || 'Server error'));
    }
  };

  return (
    <div className="app-container">
      <main className="main-content flex flex-col items-center justify-center animate-fade-in">
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
          <h1 className="text-gradient mb-4 text-center">Welcome Back</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary mt-4">Log In</button>
          </form>
        </div>
      </main>
    </div>
  );
}
