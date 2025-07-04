// app/page.tsx
'use client'; // This directive marks this file as a Client Component

import { useEffect, type ReactElement } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

/**
 * Home component that redirects to a specific page on mount.
 * This acts as the default entry point for the root URL ('/').
 *
 * @returns {ReactElement} A simple message indicating redirection.
 */
const Home = (): ReactElement => { // Removed NextPage type as it's for Pages Router
  // Initialize the Next.js router for programmatic navigation.
  const router = useRouter();

  // useEffect hook to perform the redirect after the component mounts.
  // The empty dependency array `[]` ensures this effect runs only once,
  // similar to componentDidMount in class components.
  useEffect(() => {
    // Perform the client-side redirect.
    // Replace '/my-folder/my-page' with the actual path to your desired page.
    // For example, if your page is at `app/dashboard/main/page.tsx`, the path would be '/dashboard/main'.
    router.push('/products'); // <--- IMPORTANT: Change this path to your actual page!
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Optional: A message to display during the brief redirect.
          This will be visible for a very short period before the navigation occurs. */}
      <p className="text-lg text-gray-700 font-inter">Redirecting to your main page...</p>
    </div>
  );
};

export default Home;