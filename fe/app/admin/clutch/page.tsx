'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Clutch } from '@/lib/types';

interface PaginatedResponse {
  data: Clutch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminClutchPage() {
  const [clutches, setClutches] = useState<Clutch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClutches();
  }, [page]);

  async function fetchClutches() {
    try {
      const response = await apiGet<PaginatedResponse>(`/admin/clutch/list?page=${page}&limit=10`);
      if (response.success && response.data) {
        setClutches(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load clutch profiles');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading clutch profiles...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="mb-8 text-4xl font-bold text-black dark:text-zinc-50">
            Clutch Profiles
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Total: {total} profile(s)
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
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Profile Link
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-zinc-50">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {clutches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-zinc-600 dark:text-zinc-400">
                      No clutch profiles found.
                    </td>
                  </tr>
                ) : (
                  clutches.map((clutch) => (
                    <tr key={clutch._id}>
                      <td className="px-6 py-4 font-medium text-black dark:text-zinc-50">
                        {clutch.fullName}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {clutch.email}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {clutch.service}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {clutch.profileLink ? (
                          <a
                            href={clutch.profileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Profile
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {clutch.createdAt
                          ? new Date(clutch.createdAt).toLocaleDateString()
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


