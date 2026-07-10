import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatusErrorModal from '../components/StatusErrorModal';

const UserProfile = () => {
  const { user, deleteMutation } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="min-h-[calc(100dvh-81px)] flex flex-col items-center justify-start sm:justify-center bg-background sm:p-6 font-poppins overflow-y-auto">
      <div className="w-full min-h-[calc(100dvh-81px)] sm:min-h-0 sm:h-auto sm:max-w-[450px] 
                      bg-geodude-900 border-0 sm:border border-geodude-800 rounded-none sm:rounded-3xl 
                      flex flex-col justify-center sm:justify-start p-8 sm:p-10 my-auto sm:my-0">

        <h2 className="text-2xl font-bold text-foreground mb-6">Account Settings</h2>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-paper-500 mb-1">
              Username
            </label>
            <p className="text-lg font-medium text-paper-200">{user?.username || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-paper-500 mb-1">
              Email Address
            </label>
            <p className="text-lg font-medium text-paper-200">{user?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="pt-8 border-t border-geodude-800/80">
          <h3 className="text-lg font-semibold text-status-error mb-2">Delete Personal Account</h3>
          <p className="text-sm text-paper-400 mb-4 leading-relaxed">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-error-950/40 hover:bg-error-900/60 text-status-error border border-error-800/60 font-medium rounded-xl transition-colors text-sm"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-geodude-950/40 rounded-xl border border-geodude-800/60 text-center">
              <p className="text-foreground text-sm font-medium mb-3">Are you absolutely sure?</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-error-600 hover:bg-error-500 disabled:bg-error-800/30 disabled:text-status-error/50 text-foreground text-sm font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? 'Processing...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-xl text-paper-400 bg-geodude-900 border border-geodude-800 hover:bg-geodude-800 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <StatusErrorModal
            isOpen={deleteMutation.isError}
            onClose={() => deleteMutation.reset()}
            title="Account Deletion Failed"
            message={deleteMutation.error?.response?.data?.detail}
            fallback="An unexpected error occurred while deleting your account. Please try again."
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;