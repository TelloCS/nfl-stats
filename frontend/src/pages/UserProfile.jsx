import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
  const { user, deleteMutation } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="min-h-[calc(100dvh-81px)] flex flex-col items-center justify-start sm:justify-center bg-black sm:p-6 font-poppins overflow-y-auto">
      <div className="w-full min-h-[calc(100dvh-81px)] sm:min-h-0 sm:h-auto sm:max-w-[450px] 
                      bg-neutral-900 border-0 sm:border border-neutral-800 rounded-none sm:rounded-3xl 
                      flex flex-col justify-center sm:justify-start p-8 sm:p-10 my-auto sm:my-0">

        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Username
            </label>
            <p className="text-lg font-medium text-neutral-200">{user?.username || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Email Address
            </label>
            <p className="text-lg font-medium text-neutral-200">{user?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800/80">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Personal Account</h3>
          <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 font-medium rounded-xl transition-colors text-sm"
            >
              Delete Account...
            </button>
          ) : (
            <div className="p-4 bg-neutral-950/40 rounded-xl border border-neutral-800/60 text-center">
              <p className="text-white text-sm font-medium mb-3">Are you absolutely sure?</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800/30 disabled:text-red-400/50 text-white text-sm font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? 'Processing...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-xl text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deleteMutation.isError && (
            <p className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-xl font-medium">
              Error deleting account. Please verify your session and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;