'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center py-8 px-4 bg-white min-h-[calc(100vh-64px)]"> {/* Changed background to white for cleaner look like examples */}

      {/* Hero Section - Inspired by both UsabilityHub and Hotjar */}
      <section className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-16 md:py-24 px-4 md:px-8">
        {/* Left Content Area (Headline, Sub-headline, CTA) */}
        <div className="flex-1 text-center md:text-left md:pr-12 mb-12 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Empowering Small Business with Smart Finance.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-lg mb-8">
            A simple, efficient, and cost effective way to manage your utility bills. Upload your PDFs and let our AI extract the key information for you.
          </p>
          <Link href="/signin" className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out">
            Get Started Now
          </Link>
        </div>

        {/* Right Content Area (Image/Illustration) */}
        <div className="flex-1 flex justify-center md:justify-end">
          {/* Your Logo with Summary Text as the main visual element */}
          {/* IMPORTANT: For best integration, ensure /assets/images/logo.png has a TRANSPARENT BACKGROUND. */}
          <div className="relative w-[500px] h-[500px] flex items-center justify-center"> {/* Container for logo and summary */}
            <Image
              src="/assets/images/logo.png" // Your logo with transparent background
              alt="Simple Hand Finance Logo"
              width={800}
              height={800}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      
    </div>
  );
}