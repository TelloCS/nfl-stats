import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

api.defaults.xsrfCookieName = 'csrftoken';
api.defaults.xsrfHeaderName = 'X-CSRFToken';

export const register = async ({ username, email, password1, password2 }) => {
    const body = JSON.stringify({ username, email, password1, password2 });
    const { data } = await api.post('/auth/signup/', body);
    return data;
};

export const login = async ({ email, password }) => {
    const body = JSON.stringify({ email, password });
    const { data } = await api.post('/auth/login/', body);
    return data;
};

export const logout = async () => {
    const { data } = await api.post('/auth/logout/');
    return data;
};

export const getProfile = async () => {
    const { data } = await api.get('/auth/user/me/');
    return data;
};

export const deleteAccount = async () => {
    const { data } = await api.delete('/auth/delete-account/');
    return data;
};

export const passwordResetRequest = async ({ email }) => {
    const { data } = await api.post('/auth/password-reset/', { email });
    return data
}

export const passwordResetConfirm = async (uid, token, newPassword) => {
    const body = { uid, token, new_password: newPassword };
    const { data } = await api.post('/auth/password-reset-confirm/', body);
    return data;
}

export default api;