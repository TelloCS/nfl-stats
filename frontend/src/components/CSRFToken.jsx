import { useEffect } from 'react';
import axios from 'axios';

const CSRFToken = () => {
  useEffect(() => {
    const ensureCSRFToken = async () => {
      try {
        await axios.get('/auth/csrf-cookie');
      } catch (err) {
        console.error('CSRF Token fetch failed', err);
      }
    };

    ensureCSRFToken();
  }, []);

  return null;
};

export default CSRFToken;