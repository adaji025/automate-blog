'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';
import { BlogPost } from '@/lib/types';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await apiGet<BlogPost>(`/user/blog/single/${slug}`);
        if (response.success && response.data) {
          setPost(response.data);
          
          // Fetch related posts
          const relatedResponse = await apiPost<BlogPost[]>('/user/blog/related', {
            title: response.data.title,
          });
          if (relatedResponse.success && relatedResponse.data) {
            setRelatedPosts(relatedResponse.data);
          }
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading blog post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">Error: {error || 'Post not found'}</div>
        <Link href="/blog" className="ml-4 text-blue-600 hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/blog"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to Blog
        </Link>
        
        <article className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
            {post.title}
          </h1>
          
          {post.duration && (
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              {post.duration} read
            </p>
          )}

          {post.assets && post.assets.length > 0 && (
            <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={post.assets[0].url}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none text-zinc-700 dark:prose-invert dark:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-black dark:text-zinc-50">
              Related Posts
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/blog/${relatedPost.slug}`}
                  className="rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h3 className="text-lg font-semibold text-black hover:text-blue-600 dark:text-zinc-50">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

