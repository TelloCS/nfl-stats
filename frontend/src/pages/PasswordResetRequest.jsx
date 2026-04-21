import { useState } from 'react';
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

  const inputClasses = "block w-full p-2.5 pl-10 text-sm text-white border border-neutral-800 rounded-lg bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-transparent transition-all duration-200";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] sm:p-6">
      <CSRFToken />
      <div className='w-full min-h-screen sm:min-h-0 sm:max-w-[450px] 
                      bg-neutral-900 border-none sm:border border-neutral-800 sm:rounded-3xl 
                      flex flex-col items-center justify-center p-12 sm:p-10'>

        <div className='w-full flex flex-col items-center text-center mb-8'>
          <div className='bg-neutral-900 p-3 rounded-2xl mb-4 border border-neutral-800'>
            <MessageCircleQuestionMark size={28} className="text-neutral-400" />
          </div>
          <h2 className='text-2xl font-bold text-white'>Forgot your Password?</h2>
          <p className='mt-3 text-xs text-neutral-300'>Enter your email so that we can send you password reset link</p>
        </div>
        <form onSubmit={handleSubmit} className='w-full space-y-4'>
          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail size={18} className="text-neutral-400" />
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
            className='w-full py-2.5 px-4 text-sm font-medium text-white bg-emerald-600 border border-emerald-600 rounded-lg
            hover:bg-emerald-500 hover:border-emerald-500 transition-colors mt-2'
          >
            Submit
          </button>
          {status.type === "error" || status.error === "detail" ? (
            <p className='mt-3 text-center text-sm text-neutral-500'>
              {status.msg}
            </p>
          ) : status.type === "success" && (
            <p className='mt-3 text-center text-sm text-neutral-500'>
              {status.msg}
            </p>
          )}
        </form>

      </div>
    </div>
  );
};

export default PasswordResetRequest;