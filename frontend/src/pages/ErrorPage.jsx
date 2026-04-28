import { useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  const statusCode = error?.status || "500";
  const errorMessage = error?.statusText || error?.message || "An unexpected error occurred.";

  const errorContent = {
    400: {
      title: "Bad Request",
      description: "The server couldn't understand the request. Check your input."
    },
    401: {
      title: "Unauthorized",
      description: "You need to be logged in to access this page."
    },
    403: {
      title: "Access Forbidden",
      description: "You don't have permission to view this resource."
    },
    404: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or has been moved."
    },
    500: {
      title: "Server Error",
      description: error?.message || "An unexpected internal error occurred."
    }
  };

  const { title, description } = errorContent[statusCode] || {
    title: "Something went wrong",
    description: error?.statusText || "An unknown error has occurred."
  };

  return (
    <div className="relative min-h-[calc(100vh-81px)] bg-[#000000] flex flex-col justify-center overflow-hidden font-poppins">
      <div className="text-center">

        <h1 className="text-[180px] font-black text-neutral-200 leading-none">
          {statusCode}
        </h1>

        <div className="relative mt-12">
          <h2 className="text-3xl font-bold text-neutral-400 mb-3">
            {title}
          </h2>

          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            {description}
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