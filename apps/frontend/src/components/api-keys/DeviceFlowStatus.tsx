'use client';

import { useState } from 'react';

export default function DeviceFlowStatus() {
  const [status, setStatus] = useState('idle');

  const startDeviceFlow = () => {
    setStatus('authorizing');
    // Mocking the flow
    setTimeout(() => {
      setStatus('success');
    }, 5000);
  };

  return (
    <div className="p-6 border-t border-gray-200">
      {status === 'idle' && (
        <div>
          <h3 className="text-md font-semibold text-gray-900">Authorize with GitHub</h3>
          <p className="mt-1 text-sm text-gray-600">Generate a new API key by authorizing your account with GitHub.</p>
          <button
            onClick={startDeviceFlow}
            className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900"
          >
            Authorize with GitHub
          </button>
        </div>
      )}

      {status === 'authorizing' && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Visit{' '}
            <a href="#" className="text-indigo-600 underline">
              github.com/login/device
            </a>{' '}
            and enter the code below.
          </p>
          <div className="text-2xl font-mono bg-gray-100 p-3 rounded-md d-inline-block">ABCD-1234</div>
          <div className="mt-4 flex justify-center items-center">
            <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <p className="text-sm text-gray-500 ml-3">Waiting for authorization...</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">Authorization Successful!</p>
          <p className="text-sm text-gray-600">Your new API key has been added to your list.</p>
        </div>
      )}
    </div>
  );
}
