'use client';

import { useState, FormEvent } from 'react';
import { apiPost } from '@/lib/api';
import { CreateContactData } from '@/lib/types';

export default function ContactPage() {
  const [formData, setFormData] = useState<CreateContactData>({
    fullName: '',
    email: '',
    subject: '',
    message: '',
    phone: '',
    captcha: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiPost('/contact/create', formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Message sent successfully!' });
        setFormData({
          fullName: '',
          email: '',
          subject: '',
          message: '',
          phone: '',
          captcha: '',
        });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-zinc-50">
          Contact Us
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
            <label htmlFor="phone" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="subject" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="captcha" className="mb-2 block font-medium text-black dark:text-zinc-50">
              Captcha (Optional)
            </label>
            <input
              type="text"
              id="captcha"
              name="captcha"
              value={formData.captcha}
              onChange={handleChange}
              placeholder="Enter captcha"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Note: This should integrate with Friendly Captcha in production
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

