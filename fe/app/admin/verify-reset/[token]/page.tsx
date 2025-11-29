'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';

export default function VerifyResetPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await apiGet(`/admin/auth/verify-reset/${token}`);
        if (response.success) {
          router.push(`/admin/reset-password/${token}`);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || 'Invalid or expired token');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      verifyToken();
    }
  }, [token, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-lg">Verifying token...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
          <div className="mt-4 text-center">
            <a href="/admin/password-reset" className="text-sm text-blue-600 hover:underline">
              Request new reset link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


