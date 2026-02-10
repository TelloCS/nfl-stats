import { useRouteError, Link } from "react-router-dom";

export default function GenericErrorPage() {
  const error = useRouteError();

  const statusCode = error?.status || "500";
  const errorMessage = error?.statusText || error?.message || "An unexpected error occurred.";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="text-center relative">

        <h1 className="text-[180px] font-black text-gray-200 leading-none select-none">
          {statusCode}
        </h1>

        <div className="relative mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Something went wrong
          </h2>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {errorMessage}
          </p>

          <Link
            to="/"
            className="bg-[#333333] text-white px-8 py-3 rounded-md font-bold hover:bg-black transition-transform active:scale-95 inline-block shadow-md"
          >
            Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}