// components/SignInButtons.tsx
'use client'; // This must be a client component

import React from 'react';
import { signIn } from "next-auth/react"; // Client-side function

interface SignInButtonsProps {
  // If you need any props passed down from the server page, define them here.
  // For this case, we don't need any special props, as callbackUrl is hardcoded.
  // You could make callbackUrl a prop if you wanted it dynamic.
}

export default function SignInButtons(props: SignInButtonsProps) { // Renamed to SignInButtons
  return (
    <div className="space-y-4">
      {/* Google Sign-In Button */}
      <button
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
      >
        {/* Google Icon Placeholder */}
        <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.083 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 8.065 3.012l5.656-5.656C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20V20h-.001Z" fill="#EA4335" />
        </svg>
        Log in with Google
      </button>

      {/* GitHub Sign-In Button */}
      <button
        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
        className="flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
      >
        {/* GitHub Icon Placeholder */}
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.372 0 12c0 5.303 3.438 9.799 8.205 11.385.6.11.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.727-4.042-1.61-4.042-1.61-.546-1.387-1.334-1.758-1.334-1.758-1.09-.744.083-.729.083-.729 1.205.086 1.838 1.238 1.838 1.238 1.07 1.834 2.809 1.304 3.492.997.108-.775.418-1.304.762-1.605-2.665-.304-5.466-1.333-5.466-5.932 0-1.31.467-2.382 1.235-3.22-.124-.304-.535-1.524.117-3.176 0 0 1-.322 3.295 1.23a11.51 11.51 0 013-.404c1.01.006 2.015.138 3 .404 2.295-1.552 3.295-1.23 3.295-1.23.652 1.652.241 2.872.118 3.176.77.838 1.233 1.91 1.233 3.22 0 4.58-2.806 5.624-5.478 5.923.428.368.814 1.096.814 2.215 0 1.605-.015 2.898-.015 3.284 0 .32.21.691.825.577C20.562 21.799 24 17.303 24 12c0-6.628-5.372-12-12-12z" />
        </svg>
        Log in with GitHub
      </button>
    </div>
  );
}