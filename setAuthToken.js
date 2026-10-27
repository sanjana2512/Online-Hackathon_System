import axios from 'axios';

// This function takes a token, and if it exists,
// it adds it to the global 'x-auth-token' header for all axios requests.
// If there's no token, it deletes it from the header.

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;