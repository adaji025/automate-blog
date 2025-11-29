import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-8 py-16">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
          Welcome to Bles Software
        </h1>
        <p className="text-center text-lg text-zinc-600 dark:text-zinc-400">
          Explore our blog, get in touch, or learn more about our services.
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link
            href="/blog"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            View Blog
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Contact Us
          </Link>
          <Link
            href="/clutch"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Clutch Profile
          </Link>
        </nav>
      </main>
    </div>
  );
}
