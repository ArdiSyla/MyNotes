import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', description: '', color: '#ffffff' });
    const [isEditing, setIsEditing] = useState(null);
    const [editNote, setEditNote] = useState({ title: '', description: '', color: '#ffffff' });
    const [error, setError] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    useEffect(() => {
        const token = localStorage.getItem('token');
if (!token) {
    console.log('No token found');
    return navigate('/login'); // Redirect to login if no token is present
}
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user info to get the user's name
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/user');
                setUserName(response.data.name); // Store the user's name
            } catch (error) {
                setError('Error fetching user info');
            }
        };

        fetchUser();
        fetchNotes();
    }, [token, navigate]);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/notes');
            setNotes(response.data);
        } catch (error) {
            setError('Error fetching notes');
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/notes', newNote);
            setNewNote({ title: '', description: '', color: '#ffffff' });
            fetchNotes();
        } catch (error) {
            setError('Error creating note');
        }
    };

    const handleUpdateNote = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/notes/${isEditing}`, editNote);
            setIsEditing(null);
            fetchNotes();
        } catch (error) {
            setError('Error updating note');
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await axios.delete(`http://localhost:5000/api/notes/${noteId}`);
            fetchNotes();
        } catch (error) {
            setError('Error deleting note');
        }
    };

    const startEditing = (note) => {
        setIsEditing(note._id);
        setEditNote({ title: note.title, description: note.description, color: note.color });
    };

    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        setNotes([...notes].reverse());
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="notes-container">
            <nav className="notes-nav">
                <img src="/MyNotes_logo.png" alt="Logo" className="logo" />
                <h1>My Notes</h1>
                {userName && <h2>Start writing your notes, {userName}!</h2>}  {/* Displaying the user's name */}
                <div className="nav-controls">
                    <button onClick={toggleSortOrder} className="sort-button">
                        {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </button>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            {error && <div className="error-message">{error}</div>}

            <div className="create-note-form">
                <form onSubmit={handleCreateNote}>
                    <input
                        type="text"
                        placeholder="Note Title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Note Description"
                        value={newNote.description}
                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                        required
                    />
                    <label>
                        Select Note Color:
                        <input
                            type="color"
                            value={newNote.color}
                            onChange={(e) => setNewNote({ ...newNote, color: e.target.value })}
                        />
                    </label>
                    <button type="submit">Add Note</button>
                </form>
            </div>

            <div className="notes-grid">
                {notes.map((note) => (
                    <div
                        key={note._id}
                        className="note"
                        style={{ backgroundColor: note.color || '#ffffff' }}
                    >
                        {isEditing === note._id ? (
                            <form onSubmit={handleUpdateNote} className="edit-form">
                                <input
                                    type="text"
                                    value={editNote.title}
                                    onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    value={editNote.description}
                                    onChange={(e) => setEditNote({ ...editNote, description: e.target.value })}
                                    required
                                />
                                <label>
                                    Edit Note Color:
                                    <input
                                        type="color"
                                        value={editNote.color}
                                        onChange={(e) => setEditNote({ ...editNote, color: e.target.value })}
                                    />
                                </label>
                                <div className="edit-buttons">
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setIsEditing(null)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h3>{note.title}</h3>
                                <p>{note.description}</p>
                                <div className="note-date">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                </div>
                                <div className="note-buttons">
                                    <button onClick={() => startEditing(note)}>Edit</button>
                                    <button onClick={() => handleDeleteNote(note._id)}>Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
