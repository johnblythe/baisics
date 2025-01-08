export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            A sign in link has been sent to your email address.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-sm text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Click the link in your email to sign in.
            </p>
            <p className="mt-4 text-gray-500 dark:text-gray-500">
              If you don&apos;t see it, check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 