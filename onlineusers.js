import React from 'react';
import './onlineusers.css';

export default function onlineusers({ users }) {
  const usersList = Object.entries(users);

  return (
    <div className="online-users-container">
      <h3>Online Users ({usersList.length})</h3>
      <div className="users-list">
        {usersList.length === 0 ? (
          <p className="no-users">No users online</p>
        ) : (
          usersList.map(([uid, user]) => (
            <div key={uid} className="user-item">
              <div className="user-avatar">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.displayName}</span>
              <span className="status-dot"></span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}