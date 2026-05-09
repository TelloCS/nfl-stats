import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { passwordResetConfirm } from '../api/authentication';
import { LogIn, Mail, Lock, Eye, EyeOff, RotateCcwKey } from 'lucide-react';
import CSRFToken from '../components/CSRFToken';

const PasswordResetConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: "Passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setStatus({ type: "error", msg: "Password must be at least 8 characters long." });
      return;
    }

    setIsLoading(true);

    try {
      await passwordResetConfirm(uid, token, newPassword);
      setStatus({ type: "success", msg: "Password reset successful! Redirecting to login..." });

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Invalid or expired reset link. Please request a new one.";
      let finalMsg = "";

      if (Array.isArray(errorMsg)) {
        finalMsg = errorMsg.join(' ');
      } else if (typeof errorMsg === 'object' && errorMsg !== null) {
        finalMsg = Object.values(errorMsg).flat().join(' ');
      } else {
        finalMsg = errorMsg;
      }

      setStatus({ type: "expired", msg: finalMsg });

    } finally {
      setIsLoading(false);
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
            <RotateCcwKey size={28} className="text-paper-400" />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Reset your Password</h2>
          <p className='mt-3 text-xs text-paper-300'>Please set your new password</p>
        </div>

        <form onSubmit={handleSubmit} className='w-full space-y-4'>
          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-paper-400" />
            </div>
            <input
              className={inputClasses}
              type={showPassword ? 'text' : 'password'}
              placeholder='New password'
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <PasswordToggle isVisible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>

          <div className='relative'>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-paper-400" />
            </div>
            <input
              className={inputClasses}
              type={showPassword ? 'text' : 'password'}
              placeholder='Re-enter password'
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-paper-400 hover:text-foreground transition-colors"
            >
            </button>
          </div>

          <button
            className='w-full py-2.5 px-4 text-sm font-medium text-foreground bg-secondary border border-secondary rounded-lg
            hover:bg-primary hover:border-primary transition-colors mt-2'
            type="submit"
            disabled={isLoading}
            style={{ padding: '10px', cursor: 'pointer' }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
          {status.type === "error" ? (
            <p className='mt-3 text-center text-sm text-status-error'>
              {status.msg}
            </p>
          ) : status.type === "success" && (
            <p className='mt-3 text-center text-sm text-status-success'>
              {status.msg}
            </p>
          )}
          {status.type === "expired" && (
            <>
              <p className='mt-3 text-center text-sm text-status-error'>
                {status.msg}
              </p>
              <div className='text-center text-sm text-paper-500'>
                Go back to {' '}
                <Link to='/login' className='font-semibold text-paper-300 hover:text-foreground hover:underline transition-colors'>
                  Log in
                </Link>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  );
};

const PasswordToggle = ({ isVisible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white transition-colors"
  >
    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
);

export default PasswordResetConfirm;