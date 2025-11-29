'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { RegisterData, AuthResponse } from '@/lib/types';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost<AuthResponse>('/admin/auth/register', formData);
      if (response.success && response.data) {
        setToken(response.data.token);
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
            Registration successful! Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-3xl font-bold text-black dark:text-zinc-50">
          Admin Register
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a
            href="/admin/login"
            className="text-sm text-blue-600 hover:underline"
          >
            Already have an account? Login
          </a>
        </div>
      </div>
    </div>
  );
}


