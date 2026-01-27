import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { register } from '../actions/authentication';
import CSRFToken from '../components/CSRFToken';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: ''
    });

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => {
            alert("Account created successfully! Please log in.");
            navigate('/login');
        },
        onError: (error) => {
            const errorData = error.response?.data?.error;
            const message = Array.isArray(errorData) 
                ? errorData.join(' ') 
                : (errorData || "Registration failed");
            alert(message);
        }
    });

    const { username, email, password1, password2 } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        
        if (password1 !== password2) {
            alert("Passwords do not match");
            return;
        }

        registerMutation.mutate({ username, email, password1, password2 });
    };

    return (
        <div className='container mt-5'>
            <CSRFToken />
            <h1>Create Account</h1>
            <p>Join us by creating your account</p>
            
            <form onSubmit={onSubmit}>
                <div className='form-group mb-3'>
                    <input
                        className='form-control'
                        type='email'
                        placeholder='Email*'
                        name='email'
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className='form-group mb-3'>
                    <input
                        className='form-control'
                        type='text'
                        placeholder='Username*'
                        name='username'
                        value={username}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className='form-group mb-3'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='Password*'
                        name='password1'
                        value={password1}
                        onChange={onChange}
                        minLength='10'
                        required
                    />
                </div>
                <div className='form-group mb-3'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='Confirm Password*'
                        name='password2'
                        value={password2}
                        onChange={onChange}
                        minLength='10'
                        required
                    />
                </div>
                
                <button 
                    className='btn btn-success' 
                    type='submit'
                    disabled={registerMutation.isPending}
                >
                    {registerMutation.isPending ? 'Creating Account...' : 'Register'}
                </button>
            </form>
        </div>
    );
}