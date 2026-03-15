import { useEffect } from 'react';
import api from '../actions/authentication/';

let hasRequestedToken = false;

const CSRFToken = () => {
  useEffect(() => {
    const ensureCSRFToken = async () => {
      const cookieName = api.defaults.xsrfCookieName;
      const cookieExists = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${cookieName}=`));

      if (!hasRequestedToken && !cookieExists) {
        try {
          hasRequestedToken = true;
          await api.get('/auth/csrf-cookie');
          
        } catch {
          hasRequestedToken = false;
        }
      }
    };

    ensureCSRFToken();
  }, []);

  return null;
};

export default CSRFToken;