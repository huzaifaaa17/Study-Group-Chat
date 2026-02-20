# Study Group Chat + Notes Sharing App

A real-time study group chat application with notes sharing functionality, built with React and Firebase v9 modular SDK.

## Features

### 🔐 Authentication
- Email/password signup and login
- Google Sign-In
- Auth persistence
- Protected routes

### 💬 Real-Time Chat
- Real-time group chat per study room
- Message history
- Online user status
- Automatic disconnect handling

### 📝 Notes Management
- Create, read, update, and delete notes
- Room-specific notes
- Only authors can edit/delete their notes
- Real-time updates

### 👥 Online Users
- See who's online in each room
- Real-time status updates
- Automatic cleanup on disconnect

### 🔔 Push Notifications
- Firebase Cloud Messaging integration
- Browser notifications for new messages
- Permission request handling

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - Authentication (Email/Password and Google)
   - Realtime Database
   - Firestore
   - Cloud Messaging

### 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Copy your Firebase configuration
3. Replace the configuration in `src/firebase/config.js`

### 3. Configure Firebase Cloud Messaging

1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Generate a new Web Push certificate (VAPID key)
3. Copy the VAPID key and replace `YOUR_VAPID_KEY` in `src/utils/notifications.js`
4. Update the Firebase config in `public/firebase-messaging-sw.js`

### 4. Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`
5. Deploy Realtime Database rules: `firebase deploy --only database`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── login.js
│   │   ├── Sign.js
│   │   └── auth.css
│   ├── dashboard/
│   │   ├── dashboard.js
│   │   └── dashboard.css
│   ├── room/
│   │   ├── room.js
│   │   ├── chat.js
│   │   ├── notes.js
│   │   ├── onlineUsers.js
│   │   ├── room.css
│   │   ├── chat.css
│   │   ├── notes.css
│   │   └── onlineUsers.css
│   └── PrivateRoute.js
├── contexts/
│   └── authcontext.js
├── firebase/
│   └── config.js
├── utils/
│   └── notifications.js
├── app.js
├── app.css
├── index.js
└── index.css
```

## Available Study Rooms

- **Mathematics 101** - Calculus and Algebra
- **Physics 201** - Classical Mechanics
- **Computer Science 301** - Data Structures
- **Chemistry 101** - General Chemistry
- **Biology 201** - Molecular Biology

## Security Rules

### Firestore
- Users can read all notes
- Users can only create notes with their own userId
- Users can only update/delete their own notes
- Required fields are validated

### Realtime Database
- Authenticated users can read all messages
- Authenticated users can write messages
- Users can only update their own online status
- Message structure is validated

## Technologies Used

- **React 18** - UI framework
- **React Router v6** - Routing
- **Firebase v9** - Backend services
  - Authentication
  - Realtime Database
  - Firestore
  - Cloud Messaging
- **Context API** - State management

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note:** Push notifications require HTTPS in production.

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Troubleshooting

### Notifications Not Working
- Ensure VAPID key is correctly configured
- Check browser notification permissions
- Verify service worker is registered
- Use HTTPS in production

### Real-time Updates Not Working
- Check Firebase configuration
- Verify security rules are deployed
- Ensure user is authenticated
- Check browser console for errors

### Authentication Issues
- Verify Firebase Auth is enabled
- Check email/password provider is enabled
- Ensure Google Sign-In is configured
- Check redirect URIs in Firebase Console

## License

MIT License - feel free to use this project for learning and development.