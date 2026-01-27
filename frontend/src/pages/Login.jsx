// containers/Login.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../actions/authentication';
import CSRFToken from '../components/CSRFToken';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            console.log("Login Successful:", data);
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            console.error("Login Failed:", error.response?.data);
            alert(error.response?.data?.error || "Login failed");
        }
    });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <div className='container mt-5'>
            <CSRFToken /> 
            
            <h1>Sign In</h1>
            <p>Sign into your Account</p>
            
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='email'
                        placeholder='Email'
                        name='email'
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className='form-group mt-3'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='Password'
                        name='password'
                        value={password}
                        onChange={onChange}
                        minLength='6'
                        required
                    />
                </div>
                
                <button 
                    className='btn btn-primary mt-3' 
                    type='submit'
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? 'Authenticating...' : 'Login'}
                </button>
            </form>
            
            {loginMutation.isError && (
                <div className="alert alert-danger mt-3">
                    {loginMutation.error.response?.data?.error || "Authentication failed"}
                </div>
            )}
        </div>
    );
}