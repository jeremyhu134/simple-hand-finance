// components/AuthButtons.tsx
'use client'; // This makes it a Client Component

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For client-side redirects

interface AuthButtonsProps {
    initialSession: any; // Type this more specifically if you have a Session type
}

export default function AuthButtons({ initialSession }: AuthButtonsProps) {
    // Corrected: use 'initialData' to pass the pre-fetched session
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
        return (
            <div className="px-6 py-2 border border-gray-500 text-gray-500 rounded-md text-sm md:text-base font-semibold">
                Loading...
            </div>
        );
    }

    if (status === 'authenticated') {
        return (
            <button
                onClick={async () => {
                    await signOut({ redirect: false }); // Prevent default redirect by next-auth
                    router.push('/signin'); // Manually redirect after signOut
                }}
                className="px-6 py-2 border border-green-500 text-green-500 rounded-md text-sm md:text-base font-semibold hover:bg-green-500 hover:text-white transition duration-200"
            >
                Log Out
            </button>
        );
    }

    // If status is 'unauthenticated'
    return (
        <Link
            href="/signin"
            className="px-6 py-2 border border-green-500 text-green-500 rounded-md text-sm md:text-base font-semibold hover:bg-green-500 hover:text-white transition duration-200"
        >
            Log in
        </Link>
    );
}