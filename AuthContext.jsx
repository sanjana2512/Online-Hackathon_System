import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import setAuthToken from './utils/setAuthToken';

// --- API URL ---
const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api';

// --- Initial State & Reducer ---
const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  isLoading: true,
  user: null,
  error: null,
};

const authReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: payload,
        error: null,
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
    case 'REGISTER_FAIL':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      setAuthToken(null);
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: payload,
      };
    default:
      return state;
  }
};

// --- Auth Provider Component ---
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app mount
  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  // --- Actions ---

  // 1. Load User
  const loadUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      dispatch({
        type: 'USER_LOADED',
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.msg || 'Failed to load user',
      });
    }
  };

  // 2. Create Razorpay Order (Step 1)
  const createOrder = async ({ email, teamName }) => {
    try {
      const res = await axios.post(`${API_URL}/auth/create-order`, { email, teamName });
      return { success: true, order: res.data.order };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || 'Failed to create payment order.';
      return { success: false, error: errorMsg };
    }
  };

  // 3. Trigger Razorpay Checkout and Register (Step 2)
  const registerWithPayment = async (formData) => {
    // This endpoint handles payment verification AND user saving
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data, // The { token }
      });
      
      setAuthToken(res.data.token);
      await loadUser(); 
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed after payment verification.';
      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  // 4. Login User
  const login = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      setAuthToken(res.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Invalid Credentials';
      dispatch({ type: 'LOGIN_FAIL', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  // 5. Logout
  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loadUser,
        createOrder,
        registerWithPayment,
        login,
        logout,
      }}
    >
      {!state.isLoading
        ? children
        : <div style={{ ...styles.quizContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading App...</div>}
    </AuthContext.Provider>
  );
};

// --- Custom Hook ---
export const useAuth = () => useContext(AuthContext);

// --- Styles ---
const styles = {
  quizContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    background: '#f4f7f6',
  }
};
