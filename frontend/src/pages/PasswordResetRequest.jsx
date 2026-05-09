import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetRequest } from '../api/authentication';
import { LogIn, Mail, Lock, Eye, EyeOff, MessageCircleQuestionMark } from 'lucide-react';
import CSRFToken from '../components/CSRFToken';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await passwordResetRequest({ email })
      setStatus({ type: 'success', msg: 'Check your email for a reset link.' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Something went wrong. Please try again.';
      setStatus({ type: 'error', msg: errorMsg });
    }
  };

  const inputClasses = "block w-full p-2.5 pl-10 text-sm text-foreground border border-geodude-800 rounded-lg bg-geodude-900 focus:outline-none focus:ring-1 focus:ring-geodude-700 focus:border-transparent transition-all duration-200";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background sm:p-6">
      <CSRFToken />
      <div className='w-full min-h-screen sm:min-h-0 sm:max-w-[450px] 
                      bg-geodude-900 sm:border border-geodude-800 sm:rounded-3xl 
                      flex flex-col items-center justify-center p-12 sm:p-10'>

        <div className='w-full flex flex-col items-center text-center mb-8'>
          <div className='bg-geodude-900 p-3 rounded-2xl mb-4 border border-geodude-800'>
            <MessageCircleQuestionMark size={28} className="text-paper-400" />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Forgot your Password?</h2>
          <p className='mt-3 text-xs text-paper-300'>Enter your email so that we can send you password reset link</p>
        </div>
        <form onSubmit={handleSubmit} className='w-full space-y-4'>
          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail size={18} className="text-paper-400" />
            </div>
            <input
              className={inputClasses}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className='w-full py-2.5 px-4 text-sm font-medium text-foreground bg-secondary border border-secondary rounded-lg
            hover:bg-primary hover:border-primary transition-colors mt-2 mb-0'
          >
            Submit
          </button>

          <div className='text-center text-sm text-paper-500 mt-8'>
            Return to{' '}
            <Link to='/signup' className='font-semibold text-paper-300 hover:text-foreground hover:underline transition-colors'>
              Login
            </Link>
          </div>

          {status.type === "error" || status.error === "detail" ? (
            <p className='mt-3 text-center text-sm text-paper-500'>
              {status.msg}
            </p>
          ) : status.type === "success" && (
            <p className='mt-3 text-center text-sm text-paper-500'>
              {status.msg}
            </p>
          )}
        </form>

      </div>
    </div>
  );
};

export default PasswordResetRequest;