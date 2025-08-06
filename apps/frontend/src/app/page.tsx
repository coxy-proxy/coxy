import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to AI Chatbot</h1>
        <p className="mt-4 text-lg text-gray-600">
          Your friendly AI-powered chat assistant.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/sign-in" className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Sign In
          </Link>
          <Link href="/sign-up" className="px-6 py-3 text-lg font-semibold text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

