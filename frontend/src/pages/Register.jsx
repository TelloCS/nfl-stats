import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import CSRFToken from '../components/CSRFToken';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { registerMutation } = useAuth();

  useEffect(() => {
    registerMutation.reset?.();
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const { username, email, password1, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();

    if (password1 !== password2) {
      return;
    }

    registerMutation.mutate({ username, email, password1, password2 });
  };

  const inputClasses = "block w-full p-2.5 pl-10 text-sm text-white border border-neutral-800 rounded-lg bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-transparent transition-all duration-200";

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-[#000000] sm:p-6'>
      <CSRFToken />

      <div className='w-full min-h-screen sm:min-h-0 sm:max-w-[450px] 
                      bg-neutral-900 border-none sm:border border-neutral-800 sm:rounded-3xl 
                      flex flex-col items-center justify-center p-12 sm:p-10'>

        <div className='w-full flex flex-col items-center text-center mb-8'>
          <div className='bg-neutral-900 p-3 rounded-2xl mb-4 border border-neutral-800'>
            <UserPlus size={28} className="text-neutral-400" />
          </div>
          <h1 className='text-2xl font-bold text-white'>Create Account</h1>
        </div>

        <form onSubmit={onSubmit} className='w-full space-y-4'>
          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User size={18} className="text-neutral-400" />
            </div>
            <input
              className={inputClasses}
              type='text'
              id='username'
              placeholder='Username'
              name='username'
              value={username}
              onChange={onChange}
              required
            />
          </div>

          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail size={18} className="text-neutral-400" />
            </div>
            <input
              className={inputClasses}
              id='email'
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
            className='w-full py-2.5 px-4 text-sm font-medium text-white bg-emerald-600 border border-emerald-600 rounded-lg
            hover:bg-emerald-500 hover:border-emerald-500 transition-colors mt-2'
            type='submit'
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {registerMutation.isError && (
          <div className="w-full mt-4 p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg text-center animate-in fade-in slide-in-from-top-1">
            {registerMutation.error?.response?.data?.error || "Registration failed"}
          </div>
        )}

        <div className="relative w-full my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-neutral-900 text-neutral-500 uppercase tracking-widest text-xs">or</span>
          </div>
        </div>

        <Link
          to="/"
          className='w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-neutral-400 bg-neutral-900 border border-neutral-800
          rounded-lg hover:bg-neutral-800 hover:text-white transition-colors'
        >
          Continue as Guest
        </Link>

        <div className='text-center text-sm text-neutral-500 mt-8'>
          Already have an account?{' '}
          <Link to='/login' className='font-semibold text-neutral-300 hover:text-white hover:underline transition-colors'>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

const PasswordToggle = ({ isVisible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white transition-colors"
  >
    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
);