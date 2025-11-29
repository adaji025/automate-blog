'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '@/lib/api';
import { BlogPost } from '@/lib/types';

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const response = await apiGet<any>('/admin/blog/list');
      if (response.success && response.data) {
        // Handle paginated response - extract the data array
        const postsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
        
        // Ensure it's always an array
        setPosts(Array.isArray(postsData) ? postsData : []);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await apiDelete(`/admin/blog/delete/${id}`);
      if (response.success) {
        setPosts(posts.filter((post) => post._id !== id));
      } else {
        alert(response.message);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading blog posts...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
              Blog Management
            </h1>
            <div className="flex gap-4">
              <Link
                href="/admin/blog/create"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Create Post
              </Link>
              <Link
                href="/admin/blog/bulk-create"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Bulk Create
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-zinc-600 dark:text-zinc-400">
                      No blog posts found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post._id}>
                      <td className="px-6 py-4">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/blog/edit/${post._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


