import { useRouteError, Link } from "react-router-dom";

export default function GenericErrorPage() {
  const error = useRouteError();

  const statusCode = error?.status || "500";
  const errorMessage = error?.statusText || error?.message || "An unexpected error occurred.";

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="text-center">

        <h1 className="text-[180px] font-black text-neutral-200 leading-none">
          {statusCode}
        </h1>

        <div className="relative mt-12">
          <h2 className="text-3xl font-bold text-neutral-400 mb-3">
            Something went wrong
          </h2>

          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            {errorMessage}
          </p>

          <Link
            to="/"
            className="bg-neutral-900 text-white px-8 py-4 border border-neutral-800 rounded-md font-bold hover:bg-neutral-800 transition-colors"
          >
            Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}