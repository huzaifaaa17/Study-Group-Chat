import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';

// Request notification permission
export async function requestNotificationPermission() {
  try {
    if (!messaging) {
      console.log('Messaging not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key from Firebase Console
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

// Send a local notification
export function sendNotification(title, body) {
  if (Notification.permission === 'granted') {
    // Check if document is hidden (user is not on the tab)
    if (document.hidden) {
      new Notification(title, {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png'
      });
    }
  }
}

// Listen to foreground messages
export function setupMessageListener() {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    
    const { title, body } = payload.notification || {};
    if (title && body) {
      sendNotification(title, body);
    }
  });
}