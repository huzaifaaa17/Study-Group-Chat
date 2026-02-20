import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/authcontext';
import { database } from '../../firebase/config';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { sendNotification } from '../../utils/notifications';
import './chat.css';

export default function Chat({ roomId }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      console.error('❌ No current user in Chat component');
      return;
    }

    if (!roomId) {
      console.error('❌ No roomId provided');
      return;
    }

    console.log('📨 Chat: Loading messages for room:', roomId);
    console.log('👤 Chat: Current user:', currentUser.email);

    // CORRECTED PATH: rooms/{roomId}/messages
    const messagesPath = `rooms/${roomId}/messages`;
    const messagesRef = ref(database, messagesPath);

    console.log('📍 Chat: Listening to path:', messagesPath);

    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        console.log('📬 Chat: Snapshot received');
        const data = snapshot.val();

        if (data) {
          console.log('📬 Chat: Raw data:', data);

          const messagesList = Object.entries(data).map(([id, msg]) => ({
            id,
            ...msg
          }));

          // Sort by timestamp
          messagesList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

          console.log('📨 Chat: Loaded', messagesList.length, 'messages');
          setMessages(messagesList);

          // Send notification for new messages
          const lastMessage = messagesList[messagesList.length - 1];
          if (lastMessage && lastMessage.userId !== currentUser.uid) {
            const messageTime = lastMessage.timestamp || 0;
            if (Date.now() - messageTime < 2000) {
              sendNotification(
                'New Message',
                `${lastMessage.displayName}: ${lastMessage.text}`
              );
            }
          }
        } else {
          console.log('📭 Chat: No messages found for path:', messagesPath);
          setMessages([]);
        }
        setError('');
      },
      (error) => {
        console.error('❌ Chat: Error loading messages:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        setError('Failed to load messages: ' + error.message);
      }
    );

    return () => {
      console.log('🔌 Chat: Unsubscribing from messages');
      unsubscribe();
    };
  }, [roomId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!newMessage.trim()) {
      console.log('⚠️ Chat: Empty message, not sending');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to send messages');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // CORRECTED PATH: rooms/{roomId}/messages
      const messagesPath = `rooms/${roomId}/messages`;
      const messagesRef = ref(database, messagesPath);

      const messageData = {
        text: newMessage.trim(),
        userId: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email || 'Anonymous',
        timestamp: Date.now()
      };

      console.log('📤 Chat: Sending message to path:', messagesPath);
      console.log('📤 Chat: Message data:', messageData);

      await push(messagesRef, messageData);

      console.log('✅ Chat: Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error('❌ Chat: Error sending message:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="chat-container">
      {error && (
        <div className="error-message" style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          margin: '10px',
          borderRadius: '5px',
          fontSize: '14px',
          border: '1px solid #fcc'
        }}>
          <strong>⚠️ Error:</strong> {error}
          <div style={{fontSize: '12px', marginTop: '5px'}}>
            Check browser console (F12) for details
          </div>
        </div>
      )}

      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>💬 No messages yet. Start the conversation!</p>
            <p style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
              Room: <strong>{roomId}</strong>
            </p>
            <p style={{fontSize: '12px', color: '#999'}}>
              Path: rooms/{roomId}/messages
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.userId === currentUser?.uid ? 'own-message' : 'other-message'
              }`}
            >
              <div className="message-header">
                <span className="message-author">{msg.displayName || 'Anonymous'}</span>
                <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="btn-send"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}