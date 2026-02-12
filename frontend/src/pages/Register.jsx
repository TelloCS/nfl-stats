import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { register } from '../actions/authentication';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import CSRFToken from '../components/CSRFToken';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/login', { state: { message: "Account created! Please log in." } });
    },
    onError: () => {
      setValidationError(null);
    }
  });

  const { username, email, password1, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError(null);
  };

  const onSubmit = e => {
    e.preventDefault();

    if (password1 !== password2) {
      setValidationError("Passwords do not match");
      return;
    }

    registerMutation.mutate({ username, email, password1, password2 });
  };

  const handleGuestAccess = () => {
    navigate('/');
  };

  const inputClasses = "block w-full p-2.5 pl-10 text-sm text-gray-900 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent transition-all duration-200";

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <CSRFToken />

      <div className='w-full max-w-[400px] bg-white border border-neutral-200 p-8 rounded-3xl shadow-sm'>
        <div className='flex flex-col items-center text-center pb-8'>
          <div className='bg-neutral-100 p-3 rounded-2xl mb-4'>
            <UserPlus size={28} className="text-neutral-700" />
          </div>
          <h1 className='text-2xl font-bold text-neutral-800'>Create Account</h1>
        </div>

        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail size={18} className="text-neutral-400" />
            </div>
            <input
              className={inputClasses}
              type='email'
              placeholder='Email address'
              name='email'
              value={email}
              onChange={onChange}
              required
            />
          </div>

          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User size={18} className="text-neutral-400" />
            </div>
            <input
              className={inputClasses}
              type='text'
              placeholder='Username'
              name='username'
              value={username}
              onChange={onChange}
              required
            />
          </div>

          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-neutral-400" />
            </div>
            <input
              className={inputClasses}
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              name='password1'
              value={password1}
              onChange={onChange}
              minLength='10'
              required
            />
            <PasswordToggle isVisible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>

          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-neutral-400" />
            </div>
            <input
              className={inputClasses}
              type={showPassword ? 'text' : 'password'}
              placeholder='Confirm Password'
              name='password2'
              value={password2}
              onChange={onChange}
              minLength='10'
              required
            />
          </div>

          <button
            className='w-full py-2.5 px-4 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 focus:ring-4 focus:outline-none focus:ring-neutral-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2'
            type='submit'
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {(validationError || registerMutation.isError) && (
          <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center animate-in fade-in slide-in-from-top-1">
            {validationError || registerMutation.error?.response?.data?.error || "Registration failed"}
          </div>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">or</span>
          </div>
        </div>

        <button
          onClick={handleGuestAccess}
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:ring-4 focus:outline-none focus:ring-neutral-100 transition-colors'
        >
          Continue as Guest
        </button>

        <p className='text-center text-sm text-neutral-500 mt-6'>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className='font-semibold text-neutral-900 hover:underline cursor-pointer'
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

const PasswordToggle = ({ isVisible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors"
  >
    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
);