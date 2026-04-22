import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
  const { user, deleteMutation } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = e => {
    e.preventDefault();
    deleteMutation.mutate()
  }

  return (
    <div className="relative min-h-[calc(100vh-81px)] bg-[#000000] flex flex-col justify-center overflow-hidden font-poppins">
      <div className='bg-neutral-900 max-w-2xl mx-auto p-6 mb-12 rounded-lg border border-neutral-800'>
        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-white">Username</label>
            <p className="text-lg text-neutral-400">{user?.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Email Address</label>
            <p className="text-lg text-neutral-400">{user?.email}</p>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-2">Delete Personal Account</h3>
          <p className="text-sm text-neutral-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-red-700 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-neutral-900 rounded-md border border-neutral-800 text-center">
              <p className="text-white font-medium mb-3">Are you absolutely sure?</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={(e) => onSubmit(e)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-700 text-white text-sm font-medium rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Processing...' : 'Yes, Delete My Account'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deleteMutation.isError && (
            <p className="mt-3 text-sm text-red-600 font-medium">
              Error deleting account. Please verify your session and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;