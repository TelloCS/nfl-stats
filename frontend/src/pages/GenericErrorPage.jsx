import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw, Home, Clock } from "lucide-react";

const GenericErrorPage = ({ message, resetErrorBoundary }) => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = message || "An unexpected error occurred.";
  let errorStatus = "";
  let isRateLimited = false;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;

    // Check for 429 status
    if (error.status === 429) {
      isRateLimited = true;
      errorMessage = "Too many requests. Please wait a moment before trying again.";
    } else {
      errorMessage = error.statusText || error.data?.message || errorMessage;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${isRateLimited ? 'bg-amber-100' : 'bg-red-100'}`}>
            {isRateLimited ? (
              <Clock className="w-12 h-12 text-amber-600" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {errorStatus || "Oops!"}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {errorMessage}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => (resetErrorBoundary ? resetErrorBoundary() : window.location.reload())}
            className={`flex items-center justify-center gap-2 w-full py-3 px-4 text-white rounded-lg font-medium transition-colors ${isRateLimited ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          If this persists, please contact support with ID:
          <span className="font-mono ml-1 uppercase">{Math.random().toString(36).substr(2, 9)}</span>
        </p>
      </div>
    </div>
  );
};

export default GenericErrorPage;