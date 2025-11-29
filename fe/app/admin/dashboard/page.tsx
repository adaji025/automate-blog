'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { Admin } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminRole() {
      try {
        const response = await apiGet<Admin>('/admin/auth/role');
        if (response.success && response.data) {
          setAdmin(response.data);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    fetchAdminRole();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
                Admin Dashboard
              </h1>
              {admin && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Welcome, {admin.fullName}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/blog"
              className="group rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="mb-2 text-xl font-semibold text-black group-hover:text-blue-600 dark:text-zinc-50">
                Blog Management
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Create, edit, and manage blog posts
              </p>
            </Link>

            <Link
              href="/admin/contact"
              className="group rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="mb-2 text-xl font-semibold text-black group-hover:text-blue-600 dark:text-zinc-50">
                Contact Leads
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                View and manage contact form submissions
              </p>
            </Link>

            <Link
              href="/admin/clutch"
              className="group rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="mb-2 text-xl font-semibold text-black group-hover:text-blue-600 dark:text-zinc-50">
                Clutch Profiles
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                View and manage Clutch profile submissions
              </p>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


