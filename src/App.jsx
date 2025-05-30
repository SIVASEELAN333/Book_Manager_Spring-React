import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'http://localhost:8080/api/books';

function App() {
  // User Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '' });

  // Book manager states
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', isbn: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [showBooks, setShowBooks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load books when showBooks changes
  useEffect(() => {
    if (showBooks) fetchBooks();
  }, [showBooks]);

  // Fetch books from API
  const fetchBooks = () => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      });
  };

  // Book form change handler
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit add/edit book
  const handleSubmit = e => {
    e.preventDefault();

    const method = editingId === null ? 'POST' : 'PUT';
    const url = editingId === null ? API_URL : `${API_URL}/${editingId}`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).then(() => {
      setForm({ title: '', author: '', isbn: '' });
      setEditingId(null);
      setMessage(editingId === null ? 'Book added successfully!' : 'Book updated successfully!');
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    });
  };

  // Edit book
  const handleEdit = book => {
    setEditingId(book.id);
    setForm({ title: book.title, author: book.author, isbn: book.isbn });
  };

  // Delete book
  const handleDelete = id => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => fetchBooks());
  };

  // Cancel editing book
  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: '', author: '', isbn: '' });
  };

  // Filter and sort books
  const filteredBooks = books
    .filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return sortOrder === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
    });

  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Login form change handler
  const handleLoginChange = e => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  // Registration form change handler
  const handleRegisterChange = e => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  // Login handler: check credentials from localStorage
  const handleLogin = e => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = storedUsers.find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setIsLoggedIn(true);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials. Please register if you do not have an account.');
    }
  };

  // Register handler: add new user to localStorage
  const handleRegister = e => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (registerForm.username.trim() === '' || registerForm.password.trim() === '') {
      alert('Username and password cannot be empty.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = storedUsers.some(u => u.username === registerForm.username);
    if (userExists) {
      alert('Username already exists. Please choose another.');
      return;
    }

    storedUsers.push({ username: registerForm.username, password: registerForm.password });
    localStorage.setItem('users', JSON.stringify(storedUsers));
    alert('Registration successful! Please login.');
    setRegisterForm({ username: '', password: '', confirmPassword: '' });
    setIsRegistering(false);
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowBooks(false);
  };

  if (!isLoggedIn) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>

        {isRegistering ? (
          <form onSubmit={handleRegister} className="login-form">
            <input
              name="username"
              placeholder="Username"
              value={registerForm.username}
              onChange={handleRegisterChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              required
            />
            <button type="submit">Register</button>
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => setIsRegistering(false)}
              >
                Login here
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <input
              name="username"
              placeholder="Username"
              value={loginForm.username}
              onChange={handleLoginChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
            />
            <button type="submit">Login</button>
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => setIsRegistering(true)}
              >
                Register here
              </button>
            </p>
          </form>
        )}

        <button className="dark-mode-toggle small" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'} Dark Mode
        </button>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <h1>📚 Book Manager</h1>

      <div className="top-bar">
        <button onClick={() => setShowBooks(!showBooks)}>
          {showBooks ? 'Hide Book List' : 'View Book List'}
        </button>
        <button className="dark-mode-toggle small" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'} Dark Mode
        </button>
        {showBooks && (
          <>
            <input
              type="text"
              placeholder="Search by title or author"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select onChange={e => setSortOrder(e.target.value)} value={sortOrder}>
              <option value="asc">Sort A-Z</option>
              <option value="desc">Sort Z-A</option>
            </select>
          </>
        )}
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <form onSubmit={handleSubmit} className="book-form">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <input
          name="author"
          value={form.author}
          onChange={handleChange}
          placeholder="Author"
          required
        />
        <input
          name="isbn"
          value={form.isbn}
          onChange={handleChange}
          placeholder="ISBN"
          required
        />
        <button type="submit">{editingId === null ? 'Add Book' : 'Update Book'}</button>
        {editingId !== null && <button type="button" onClick={handleCancel}>Cancel</button>}
      </form>

      {message && <p className="success-message">{message}</p>}

      {loading && <div className="spinner">Loading...</div>}

      {showBooks && (
        <ul className="book-list">
          {filteredBooks.map(book => (
            <li key={book.id} className="book-item">
              <div>
                <strong>{book.title}</strong> by {book.author} (ISBN: {book.isbn})
              </div>
              <div className="actions">
                <button onClick={() => handleEdit(book)}>Edit</button>
                <button onClick={() => handleDelete(book.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
