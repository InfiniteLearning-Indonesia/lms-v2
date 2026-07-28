// Centralized API Base URL configuration for Development and Vercel Production
function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // Automatic client-side domain detection fallback for production URL
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'lms-v2.infinitelearningstudent.id' || host.endsWith('.infinitelearningstudent.id')) {
      return 'https://api.lms-v2.infinitelearningstudent.id';
    }
  }
  return 'http://localhost:7000';
}

export const API_BASE_URL = getApiBaseUrl();
