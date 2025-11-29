'use client';

import { useState, FormEvent } from 'react';
import { apiPost } from '@/lib/api';
import { CreateClutchData } from '@/lib/types';

export default function ClutchPage() {
  const [formData, setFormData] = useState<CreateClutchData>({
    fullName: '',
    email: '',
    service: '',
    profileLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiPost('/clutch/create', formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Clutch profile submitted successfully!' });
        setFormData({
          fullName: '',
          email: '',
          service: '',
          profileLink: '',
        });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit profile' });
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

  return (
    <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-zinc-50">
          Submit Clutch Profile
        </h1>
        
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {message && (
            <div
              className={`mb-6 rounded-lg p-4 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

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

          <div className="mb-4">
            <label htmlFor="service" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Service *
            </label>
            <input
              type="text"
              id="service"
              name="service"
              required
              value={formData.service}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="profileLink" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Profile Link
            </label>
            <input
              type="url"
              id="profileLink"
              name="profileLink"
              value={formData.profileLink}
              onChange={handleChange}
              placeholder="https://clutch.co/profile/..."
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

