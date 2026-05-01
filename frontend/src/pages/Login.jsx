import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import CSRFToken from '../components/CSRFToken';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { loginMutation } = useAuth();

  useEffect(() => {
    loginMutation.reset?.();
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
            <LogIn size={28} className="text-neutral-400" />
          </div>
          <h1 className='text-2xl font-bold text-white'>Sign in with email</h1>
        </div>

        <form onSubmit={onSubmit} className='w-full space-y-4'>
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
              <Lock size={18} className="text-neutral-400" />
            </div>
            <input
              className={inputClasses}
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              name='password'
              value={password}
              onChange={onChange}
              minLength='7'
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className='text-right text-neutral-300 text-sm'>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <button
            className='w-full py-2.5 px-4 text-sm font-medium text-white bg-emerald-600 border border-emerald-600 rounded-lg
            hover:bg-emerald-500 hover:border-emerald-500 transition-colors mt-2'
            type='submit'
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {loginMutation.isError && (
          <div className="w-full mt-4 p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg text-center">
            {loginMutation.error.response?.data?.error || "Invalid email or password"}
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
          Don't have an account?{' '}
          <Link to='/signup' className='font-semibold text-neutral-300 hover:text-white hover:underline transition-colors'>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}