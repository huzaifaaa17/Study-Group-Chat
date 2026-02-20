import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authcontext';
import { database } from '../../firebase/config';
import {
  ref,
  push,
  onValue,
  set,
  onDisconnect,
  serverTimestamp
} from 'firebase/database';
import chat from './chat';
import notes from './notes';
import onlineusers from './onlineusers';
import { requestNotificationPermission, sendNotification } from '../../utils/notifications';
import './room.css';

export default function Room() {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  console.log('=== ROOM DEBUG ===');
  console.log('Room ID:', roomId);
  console.log('Current User:', currentUser);
  console.log('User Email:', currentUser?.email);
  console.log('User UID:', currentUser?.uid);
  console.log('================');
  const [activeTab, setActiveTab] = useState('chat');
  const [onlineusers, setonlineusers] = useState({});
  const userStatusRef = useRef(null);

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission();

    // Set user as online in this room
    const userStatusPath = `onlineusers/${currentUser.uid}`;
    userStatusRef.current = ref(database, userStatusPath);

    const userData = {
      displayName: currentUser.displayName || currentUser.email,
      roomId: roomId,
      lastSeen: serverTimestamp()
    };

    set(userStatusRef.current, userData);

    // Set up onDisconnect
    onDisconnect(userStatusRef.current).remove();

    // Listen to online users in this room
    const onlineusersRef = ref(database, 'onlineusers');
    const unsubscribe = onValue(onlineusersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomUsers = Object.entries(data)
          .filter(([_, user]) => user.roomId === roomId)
          .reduce((acc, [uid, user]) => {
            acc[uid] = user;
            return acc;
          }, {});
        setonlineusers(roomUsers);
      } else {
        setonlineusers({});
      }
    });

    // Cleanup on unmount
    return () => {
      if (userStatusRef.current) {
        set(userStatusRef.current, null);
      }
      unsubscribe();
    };
  }, [roomId, currentUser]);

  function handleLeaveRoom() {
    if (userStatusRef.current) {
      set(userStatusRef.current, null);
    }
    navigate('/dashboard');
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <span className="online-count">
            {Object.keys(onlineusers).length} user(s) online
          </span>
        </div>
        <button onClick={handleLeaveRoom} className="btn-leave">
          Leave Room
        </button>
      </div>

      <div className="room-content">
        <div className="main-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              Notes
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'chat' ? (
              <chat roomId={roomId} />
            ) : (
              <notes roomId={roomId} />
            )}
          </div>
        </div>

        <div className="sidebar">
          <onlineusers users={onlineusers} />
        </div>
      </div>
    </div>
  );
}