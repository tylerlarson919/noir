// app/(errors)/not-found/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: '404 – Page Not Found' };

export default function NotFoundPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] sm:min-h-[60vh] stagger-fadein">
      <div className="flex flex-col p-4 w-full max-w-md items-center">

        <h1 className="text-7xl font-extrabold tracking-tight">404</h1>
        <p className="mt-4 text-lg">Sorry, we couldn’t find that page.</p>

        <Link
          href="/"
          className="mt-8 inline-block border border-black px-6 py-3 text-sm font-medium transition-colors hover:bg-black hover:text-white"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}