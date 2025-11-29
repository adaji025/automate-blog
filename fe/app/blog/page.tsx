'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { BlogPost } from '@/lib/types';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await apiGet<BlogPost[]>('/user/blog/list');
        if (response.success && response.data) {
          setPosts(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading blog posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-zinc-50">
          Blog Posts
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <p className="col-span-full text-center text-zinc-600 dark:text-zinc-400">
              No blog posts available.
            </p>
          ) : (
            posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                {post.assets && post.assets.length > 0 && (
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
                    <img
                      src={post.assets[0].url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <h2 className="mb-2 text-xl font-semibold text-black group-hover:text-blue-600 dark:text-zinc-50">
                  {post.title}
                </h2>
                {post.duration && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {post.duration} read
                  </p>
                )}
                <div
                  className="mt-4 line-clamp-3 text-zinc-600 dark:text-zinc-400"
                  dangerouslySetInnerHTML={{
                    __html: post.content.substring(0, 150) + '...',
                  }}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

