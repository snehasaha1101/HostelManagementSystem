import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ROOMS');
  
  // Data States
  const [rooms, setRooms] = useState([]);
  const [unallocated, setUnallocated] = useState([]);
  const [unpaid, setUnpaid] = useState([]);
  const [records, setRecords] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [studentPaymentFilter, setStudentPaymentFilter] = useState('ALL'); // ALL, PAID, UNPAID
  
  const fetchRooms = () => {
    api.get('/rooms').then(res => setRooms(res.data)).catch(console.error);
  };
  const fetchUnallocated = () => {
    api.get('/students/unallocated').then(res => setUnallocated(res.data)).catch(console.error);
  };
  const fetchUnpaid = () => {
    api.get('/students/unpaid').then(res => setUnpaid(res.data)).catch(console.error);
  };
  const fetchRecords = () => {
    api.get('/students/records').then(res => setRecords(res.data)).catch(console.error);
  };
  const fetchAllStudents = () => {
    api.get('/students/all').then(res => setAllStudents(res.data)).catch(console.error);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    
    // Initial fetch
    fetchRooms();
    fetchUnallocated();
    fetchRecords();
    fetchUnpaid();
    fetchAllStudents();

    // Poll every 3 seconds for real-time updates
    const interval = setInterval(() => {
      fetchRooms();
      fetchUnallocated();
      fetchRecords();
      fetchUnpaid();
      fetchAllStudents();
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleAllocate = async (roomId, studentProfileId) => {
    if (!studentProfileId) return;
    try {
      await api.post(`/rooms/${roomId}/allocate`, { studentProfileId: parseInt(studentProfileId) });
      fetchRooms();
      fetchUnallocated();
      fetchAllStudents();
      alert('Student allocated successfully!');
    } catch (e) {
      alert('Allocation failed: ' + (e.response?.data?.error || 'Error'));
    }
  };

  const filteredRooms = [...rooms].filter(room => {
    if (searchTerm && !room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    const availableBeds = room.capacity - (room.students?.length || 0);
    if (availabilityFilter === 'SINGLE' && availableBeds !== 1) return false;
    if (availabilityFilter === 'DOUBLE' && availableBeds !== 2) return false;
    if (availabilityFilter === 'TRIPLE' && availableBeds !== 3) return false;
    if (availabilityFilter === 'FILLED' && availableBeds !== 0) return false;
    return true;
  }).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));

  const filteredStudents = [...allStudents].filter(student => {
    if (studentPaymentFilter === 'PAID' && !student.hasPaid) return false;
    if (studentPaymentFilter === 'UNPAID' && student.hasPaid) return false;
    return true;
  });

  return (
    <div className="app-container">
      <nav className="glass-card flex justify-between items-center" style={{ margin: '24px 32px 0', padding: '16px 24px', borderRadius: '12px' }}>
        <h2 className="text-gradient">Admin Portal</h2>
        <button className="btn-secondary" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
      </nav>

      {/* Tab Navigation */}
      <div className="flex gap-4" style={{ margin: '24px 32px 0' }}>
        <button className={activeTab === 'ROOMS' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('ROOMS')} style={{ padding: '10px 20px', borderRadius: '8px' }}>Room Status</button>
        <button className={activeTab === 'STUDENTS' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('STUDENTS')} style={{ padding: '10px 20px', borderRadius: '8px' }}>Student Status</button>
        <button className={activeTab === 'ACTIVITY' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('ACTIVITY')} style={{ padding: '10px 20px', borderRadius: '8px' }}>Activity</button>
      </div>
      
      <main className="main-content animate-fade-in flex flex-col gap-4">
        
        {/* ROOM STATUS TAB */}
        {activeTab === 'ROOMS' && (
          <>
            {unallocated.length > 0 && (
              <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                <h4 style={{ color: 'var(--warning)' }}>Pending Allocations</h4>
                <p className="text-sm mt-1">There are {unallocated.length} students waiting to be assigned a room.</p>
              </div>
            )}
            
            {unpaid.length > 0 && (
              <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                <h4 style={{ color: 'var(--danger)' }}>Unpaid Hostel Fees</h4>
                <p className="text-sm mt-1 mb-2">The following students have been allocated a room but have not completed their fee payment:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {unpaid.map(s => (
                    <li key={s.id} className="text-sm mt-1">
                      <span style={{ color: 'var(--danger)' }}>•</span> <strong>{s.name}</strong> ({s.enrollmentNo}) - Room {s.roomNumber}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass-card">
              <h3 className="mb-4">Search & Filter Rooms</h3>
              <div className="flex items-end gap-4" style={{ flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                  <label className="input-label">Search Room Number</label>
                  <input type="text" className="input-field" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g. 101" />
                </div>
                <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                  <label className="input-label">Filter Availability</label>
                  <select className="input-field" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)} style={{ padding: '12px' }}>
                    <option value="ALL">All Rooms</option>
                    <option value="SINGLE">Singly Available (1 Bed Left)</option>
                    <option value="DOUBLE">Doubly Available (2 Beds Left)</option>
                    <option value="TRIPLE">Triply Available (3 Beds Left)</option>
                    <option value="FILLED">Fully Occupied (0 Beds Left)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="mb-4">Rooms Overview</h3>
              <div className="flex flex-col gap-4" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
                {filteredRooms.length === 0 ? <p className="text-muted">No rooms match your criteria.</p> : null}
                {filteredRooms.map(room => (
                  <div key={room.id} className="glass-card flex justify-between items-center" style={{ padding: '16px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 className="text-gradient">Room {room.roomNumber}</h4>
                      <p className="text-sm text-muted mt-1">Capacity: {room.capacity} beds | Status: <span style={{ color: room.status === 'AVAILABLE' ? 'var(--success)' : 'var(--danger)' }}>{room.status}</span></p>
                      
                      {room.students && room.students.length > 0 && (
                        <div className="mt-2 text-sm">
                          <strong className="text-muted">Occupants:</strong>
                          <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0 0' }}>
                            {room.students.map(s => (
                              <li key={s.id}>• {s.user.name} ({s.enrollmentNo})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="text-sm" style={{ fontWeight: 500 }}>
                      <p className="mb-2 text-right">{room.students?.length || 0} / {room.capacity} Assigned</p>
                      {room.status === 'AVAILABLE' && unallocated.length > 0 && (
                        <div className="flex gap-2 items-center">
                          <select id={`select-${room.id}`} className="input-field" style={{ padding: '8px', fontSize: '14px', width: 'auto' }}>
                            <option value="">Select Student...</option>
                            {unallocated.map(s => <option key={s.id} value={s.id}>{s.user.name} ({s.enrollmentNo})</option>)}
                          </select>
                          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => {
                            const val = document.getElementById(`select-${room.id}`).value;
                            handleAllocate(room.id, val);
                          }}>Assign</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STUDENT STATUS TAB */}
        {activeTab === 'STUDENTS' && (
          <div className="glass-card">
            <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <h3>Student Status & Fees</h3>
              <select className="input-field" value={studentPaymentFilter} onChange={e => setStudentPaymentFilter(e.target.value)} style={{ width: '200px', padding: '10px' }}>
                <option value="ALL">All Students</option>
                <option value="PAID">Hostel Fees Paid</option>
                <option value="UNPAID">Hostel Fees Unpaid</option>
              </select>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Mail ID</th>
                    <th style={{ padding: '12px' }}>Registration No.</th>
                    <th style={{ padding: '12px' }}>Room No.</th>
                    <th style={{ padding: '12px' }}>Payment Amount</th>
                    <th style={{ padding: '12px' }}>Fee Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '12px', textAlign: 'center' }} className="text-muted">No students found.</td></tr>
                  ) : (
                    filteredStudents.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '12px' }}>{s.name}</td>
                        <td style={{ padding: '12px' }}>{s.email}</td>
                        <td style={{ padding: '12px' }}>{s.enrollmentNo}</td>
                        <td style={{ padding: '12px' }}>{s.roomNumber}</td>
                        <td style={{ padding: '12px' }}>₹{s.paidAmount}</td>
                        <td style={{ padding: '12px', color: s.hasPaid ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                          {s.hasPaid ? 'PAID' : 'UNPAID'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'ACTIVITY' && (
          <div className="glass-card">
            <h3 className="mb-4">Recent Check-In/Check-Out Activity</h3>
            <div className="flex flex-col gap-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {records.length === 0 ? <p className="text-muted text-sm">No activity logs found.</p> : null}
              {records.map(record => (
                <div key={record.id} style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p className="text-sm" style={{ color: record.type === 'CHECK_IN' ? 'var(--success)' : 'var(--warning)', fontWeight: 'bold', fontSize: '16px' }}>
                      {record.type.replace('_', ' ')}
                    </p>
                    <p className="mt-1 text-md">{record.studentProfile?.user?.name} ({record.studentProfile?.enrollmentNo})</p>
                  </div>
                  <div className="text-sm text-muted" style={{ textAlign: 'right' }}>
                    <p>{new Date(record.timestamp).toLocaleDateString()}</p>
                    <p>{new Date(record.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}
