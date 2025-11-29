'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiPostFormData } from '@/lib/api';

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: '',
    status: 'published' as 'published' | 'pending',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('status', formData.status);

      files.forEach((file) => {
        formDataToSend.append('assets', file);
      });

      const response = await apiPostFormData('/admin/blog/create', formDataToSend);
      if (response.success) {
        router.push('/admin/blog');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 3) {
        setError('You can only upload up to 3 images');
        return;
      }
      setFiles(selectedFiles);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-8 text-4xl font-bold text-black dark:text-zinc-50">
            Create Blog Post
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-4">
              <label htmlFor="title" className="mb-2 block font-medium text-black dark:text-zinc-50">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="mb-2 block font-medium text-black dark:text-zinc-50">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={15}
                value={formData.content}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="duration" className="mb-2 block font-medium text-black dark:text-zinc-50">
                Duration *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                required
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 5 mins"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="mb-2 block font-medium text-black dark:text-zinc-50">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="published">Published</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="assets" className="mb-2 block font-medium text-black dark:text-zinc-50">
                Images (up to 3, max 2MB each) *
              </label>
              <input
                type="file"
                id="assets"
                name="assets"
                required
                multiple
                accept="image/png,image/jpg,image/jpeg"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              {files.length > 0 && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Post'}
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


