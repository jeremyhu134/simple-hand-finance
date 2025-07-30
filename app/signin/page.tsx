// app/signIn/page.tsx
// This file is designed to be a Server Component to handle the initial redirect
// if the user is already authenticated.
import { redirect } from 'next/navigation'; // For server-side redirect
import { getServerSession } from 'next-auth'; // For server-side authentication check
import { authOptions } from '../lib/authOptions'; // Import your NextAuth.js config
import React from 'react'; // Still need React for JSX
import SignInButtons from '../../components/SignInButtons'// Import your SignInButton component

// Client-side specific imports that will create the client boundary for the interactive buttons
import { signIn } from "next-auth/react";
import { Sign } from 'crypto';


export default async function SignInPage() { // Make it an async Server Component
    const session = await getServerSession(authOptions); // Check session on the server

    // If the user is ALREADY authenticated, redirect them away from the sign-in page.
    if (session) {
        redirect('/dashboard'); // Server-side redirect to dashboard
    }


    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-8 px-4 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Log in to Simple Hand Finance</h1>

                <SignInButtons>
                    
                </SignInButtons>
            </div>
        </div>
    );
}