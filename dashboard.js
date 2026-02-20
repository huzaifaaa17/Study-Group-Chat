import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authcontext';
import { useNavigate } from 'react-router-dom';
import { database } from '../../firebase/config';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';
import './dashboard.css';

const STUDY_ROOMS = [
  { id: 'math-101', name: 'Mathematics 101', description: 'Calculus and Algebra' },
  { id: 'physics-201', name: 'Physics 201', description: 'Classical Mechanics' },
  { id: 'cs-301', name: 'Computer Science 301', description: 'Data Structures' },
  { id: 'chemistry-101', name: 'Chemistry 101', description: 'General Chemistry' },
  { id: 'biology-201', name: 'Biology 201', description: 'Molecular Biology' },
];

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen to online users
    const onlineUsersRef = ref(database, 'onlineUsers');
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val();
      setOnlineUsers(data || {});
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      setError('');
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
  }

  function joinRoom(roomId) {
    setLoading(true);
    navigate(`/room/${roomId}`);
  }

  function getOnlineCount(roomId) {
    return Object.values(onlineUsers).filter(user => user.roomId === roomId).length;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1>Study Group Chat</h1>
          <div className="nav-right">
            <span className="user-name">Welcome, {currentUser?.displayName || currentUser?.email}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="header">
          <h2>Available Study Rooms</h2>
          <p>Join a room to chat with other students and share notes</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="rooms-grid">
          {STUDY_ROOMS.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3>{room.name}</h3>
                <span className="online-badge">
                  <span className="online-dot"></span>
                  {getOnlineCount(room.id)} online
                </span>
              </div>
              <p className="room-description">{room.description}</p>
              <button
                onClick={() => joinRoom(room.id)}
                disabled={loading}
                className="btn-join"
              >
                Join Room
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}