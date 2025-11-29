'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Contact } from '@/lib/types';

interface PaginatedResponse {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchContacts();
  }, [page]);

  async function fetchContacts() {
    try {
      const response = await apiGet<PaginatedResponse>(`/admin/contact/list?page=${page}&limit=10`);
      if (response.success && response.data) {
        setContacts(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading contacts...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="mb-8 text-4xl font-bold text-black dark:text-zinc-50">
            Contact Leads
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Total: {total} contact(s)
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-zinc-600 dark:text-zinc-400">
                      No contacts found.
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td className="px-6 py-4 font-medium text-black dark:text-zinc-50">
                        {contact.fullName}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {contact.email}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {contact.phone}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {contact.subject}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        <div className="max-w-xs truncate" title={contact.message}>
                          {contact.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {contact.createdAt
                          ? new Date(contact.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-black transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Previous
              </button>
              <span className="px-4 text-zinc-600 dark:text-zinc-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-black transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


