import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { styles } from '../styles';

function LoginModal({ show, onClose }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  // This state will hold any error messages from the backend
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    // Call the login function from our context
    const result = await login({ email, password });
    
    if (result.success) {
      onClose(); // Close modal on success
    } else {
      // If login fails, set the error message to display it
      setError(result.error);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2>Login</h2>
          <button style={styles.modalCloseButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <form style={styles.modalForm} onSubmit={onSubmit}>
          
          {/* This is where the error message will appear */}
          {error && <p style={styles.modalError}>{error}</p>}
          
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email Address"
            style={styles.modalInput}
            required
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Password"
            style={styles.modalInput}
            required
          />
          <button type="submit" style={styles.modalSubmitButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;

