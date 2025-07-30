'use client'

import React, { useState, useRef } from 'react';

import { useSession } from 'next-auth/react'; // Import the useSession hook
import { useRouter } from 'next/navigation'; // For client-side navigation (App Router)
import { useEffect } from 'react'; // For side effects like redirection

export default function Upload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') {
      return; // Do nothing while loading
    }
    if (status === 'unauthenticated') {
      router.push('/signin'); // This is the problematic line if not handled carefully
    }
  }, [status, router]);

  //Check Authentication and block access if not authenticated
  if (status === 'loading' || status === 'unauthenticated') {
      return (
          <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
              <p>{status === 'loading' ? 'Checking authentication...' : 'Redirecting to login...'}</p>
          </div>
      );
  }

  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setFiles(Array.from(e.target.files));
        setMessages([]);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
      if (files.length === 0) {
          setMessages(["Please select files first."]);
          return;
      }

      setLoading(true);
      setMessages([]);
      const newMessages: string[] = [];

      const formData = new FormData();
      files.forEach((file) => {
          formData.append("file", file);
      });

      try {
          const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
          });

          const apiResponse = await res.json();

          if (res.ok) {
              newMessages.push(`All selected files uploaded successfully.`);
              if (apiResponse.redirectTo) { // Check if the API response includes redirectTo
                newMessages.push(`Redirecting to dashboard...`);
                // Update messages and then immediately redirect
                setMessages(newMessages);
                await new Promise(resolve => setTimeout(resolve, 500)); // Optional: small delay for message to show
                router.push(apiResponse.redirectTo);
                return; // Crucial: Exit the function to prevent further UI updates
              }
              newMessages.push("Lambda processing result:");
              newMessages.push(JSON.stringify(apiResponse.lambdaResponse, null, 2));
          } else {
              const errorData = await res.json();
              newMessages.push(`File upload failed (server error): ${errorData.message || res.statusText}`);
          }

          const data = await res.json();
          console.log("✅ Lambda response:", data.lambdaResponse);

          newMessages.push("Lambda processing result:");
          newMessages.push(JSON.stringify(data.lambdaResponse, null, 2));

      } catch (error: any) {
          console.error(error);
          newMessages.push(`File upload failed (network error): ${error.message}`);
      } finally {
          setLoading(false);
          setMessages(newMessages);
          setFiles([]);
          if (fileInputRef.current) {
              fileInputRef.current.value = '';
          }
      }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-8 px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">Upload Bills (PDF)</h1>

          <div
              className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full cursor-pointer hover:shadow-2xl transition-shadow duration-300 ease-in-out border-2 border-dashed border-gray-300 hover:border-blue-500"
              onClick={handleBoxClick}
          >
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>

                  <p className="text-lg text-gray-600 font-semibold mb-2">Upload Files</p>
                  <p className="text-sm text-gray-500">Click anywhere in this box or drag and drop PDFs here</p>

                  {files.length > 0 && (
                      <p className="mt-4 text-sm text-gray-700">
                          {files.length} file(s) selected: {files.map(f => f.name).join(', ')}
                      </p>
                  )}
              </div>

              <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleChange}
                  ref={fileInputRef}
                  className="sr-only"
              />
          </div>

          <div className="w-full max-w-2xl mt-6 text-center">
              <button
                  onClick={handleUpload}
                  disabled={loading || files.length === 0}
                  className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {loading ? 'Processing...' : 'Create Entry'}
              </button>
          </div>

          {messages.length > 0 && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg max-w-2xl w-full max-h-60 overflow-y-auto">
                  {messages.map((msg, idx) => (
                      <pre key={idx} className="whitespace-pre-wrap text-sm text-gray-800 break-words mb-2">
                          {msg}
                      </pre>
                  ))}
              </div>
          )}
      </div>
  );
}