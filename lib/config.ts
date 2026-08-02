// Centralized API Base URL configuration for Development and Vercel Production
function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // Automatic client-side domain detection fallback for production URL
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'dev-lms-v2.infinitelearningstudent.id' ||
      host === 'lms-v2.infinitelearningstudent.id' ||
      host.endsWith('.infinitelearningstudent.id')
    ) {
      return 'https://api-lms-v2.infinitelearningstudent.id';
    }
  }
  return 'http://localhost:7000';
}

export const API_BASE_URL = getApiBaseUrl();

// Global Client-Side Fetch Interceptor to ensure Token & Credentials are always attached automatically
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const token = localStorage.getItem('auth_token');
    let urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

    if (token && (urlStr.includes('infinitelearningstudent.id') || urlStr.includes('localhost:7000') || urlStr.startsWith('/'))) {
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : {}));
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return originalFetch(urlStr, {
        ...init,
        headers,
        credentials: 'include',
      });
    }

    return originalFetch(input, init);
  };
}
