
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image'; // Import the Image component
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import AuthButtons from './AuthButtons';
import { authOptions } from '../app/lib/authOptions';

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-black p-4 text-white shadow-lg"> {/* Changed bg-black to bg-gray-900 for a slightly softer dark, added shadow */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Site Title Group */}
        <div className="flex items-center space-x-3"> {/* Added flex and space for alignment */}
          <Link href="/" className="flex items-center"> {/* Make the logo area clickable */}
            <span className="text-xl md:text-2xl font-bold tracking-wide"> {/* Adjust text size and style */}
                Simple Hand Finance
            </span>
          </Link>
        </div>

        {/* Navigation Buttons - Prettier Styling */}
        <div className="flex items-center space-x-4 md:space-x-6"> {/* Increased space for larger screens */}
          <Link href="/upload" className="px-4 py-2 rounded-md text-sm md:text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200">
            Upload
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-md text-sm md:text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200">
            Dashboard
          </Link>

          <AuthButtons initialSession={session} />
          
        </div>
      </div>
    </nav>
  );
}