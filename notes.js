import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authcontext';
import { firestore } from '../../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import './notes.css';

export default function Notes({ roomId }) {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      console.error('❌ No current user in Notes component');
      return;
    }

    console.log('📝 Notes: Loading notes for room:', roomId);
    console.log('👤 Notes: Current user:', currentUser.email);

    const notesRef = collection(firestore, 'notes');
    const q = query(notesRef, where('roomId', '==', roomId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📬 Notes: Snapshot received, size:', snapshot.size);
        const notesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort by creation date, newest first
        notesList.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        console.log('📝 Notes: Loaded', notesList.length, 'notes');
        setNotes(notesList);
        setError('');
      },
      (error) => {
        console.error('❌ Notes: Error loading notes:', error);
        setError('Failed to load notes. Check Firestore rules.');
      }
    );

    return () => {
      console.log('🔌 Notes: Unsubscribing from notes');
      unsubscribe();
    };
  }, [roomId, currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editingNote) {
        console.log('✏️ Notes: Updating note:', editingNote.id);
        const noteRef = doc(firestore, 'notes', editingNote.id);
        await updateDoc(noteRef, {
          title: title.trim(),
          content: content.trim()
        });
        console.log('✅ Notes: Note updated');
      } else {
        const noteData = {
          title: title.trim(),
          content: content.trim(),
          roomId,
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email,
          createdAt: serverTimestamp()
        };
        console.log('📤 Notes: Creating note:', noteData);
        
        const docRef = await addDoc(collection(firestore, 'notes'), noteData);
        console.log('✅ Notes: Note created with ID:', docRef.id);
      }

      resetForm();
    } catch (error) {
      console.error('❌ Notes: Error saving note:', error);
      setError('Failed to save note: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(noteId) {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      console.log('🗑️ Notes: Deleting note:', noteId);
      await deleteDoc(doc(firestore, 'notes', noteId));
      console.log('✅ Notes: Note deleted');
    } catch (error) {
      console.error('❌ Notes: Error deleting note:', error);
      alert('Failed to delete note: ' + error.message);
    }
  }

  function handleEdit(note) {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowForm(true);
  }

  function resetForm() {
    setTitle('');
    setContent('');
    setEditingNote(null);
    setShowForm(false);
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h3>Study Notes</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-add-note"
        >
          {showForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          margin: '10px 20px',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="note-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            required
            className="note-title-input"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note Content"
            required
            rows="6"
            className="note-content-input"
          />
          <div className="form-buttons">
            <button type="submit" disabled={loading} className="btn-save">
              {loading ? 'Saving...' : (editingNote ? 'Update Note' : 'Save Note')}
            </button>
            {editingNote && (
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="no-notes">
            <p>📝 No notes yet. Create the first one!</p>
            <p style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
              Room: {roomId}
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h4>{note.title}</h4>
                {note.userId === currentUser.uid && (
                  <div className="note-actions">
                    <button
                      onClick={() => handleEdit(note)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="note-content">{note.content}</p>
              <div className="note-footer">
                <span className="note-author">By: {note.userName}</span>
                <span className="note-date">{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}