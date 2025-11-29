'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiPostFormData } from '@/lib/api';

export default function AdminBlogBulkCreatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiPostFormData('/admin/blog/create/bulk', formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/blog');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to bulk create blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-8 text-4xl font-bold text-black dark:text-zinc-50">
            Bulk Create Blog Posts
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
              Blog posts created successfully! Redirecting...
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-6">
              <label htmlFor="file" className="mb-2 block font-medium text-black dark:text-zinc-50">
                Upload File *
              </label>
              <input
                type="file"
                id="file"
                name="file"
                required
                onChange={handleFileChange}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Upload a file containing blog post data. Format should match backend requirements.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || success}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upload and Create'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-zinc-300 px-6 py-3 text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}


