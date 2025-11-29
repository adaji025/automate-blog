'use client';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminToken', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

