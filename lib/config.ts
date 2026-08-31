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
if (typeof window !== 'undefined' && !(window.fetch as any).__patched) {
  const originalFetch = window.fetch;
  const patchedFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    let token: string | null = null;
    try {
      token = localStorage.getItem('auth_token');
    } catch {
      // localStorage unavailable (Safari Private Mode, cross-origin iframe, etc.)
    }

    // Resolve URL string from any input type
    let urlStr: string;
    let headers: Headers;
    let body: BodyInit | undefined;

    if (typeof input === 'string') {
      urlStr = input;
      headers = new Headers(init?.headers || {});
      body = init?.body ?? undefined;
    } else if (input instanceof URL) {
      urlStr = input.toString();
      headers = new Headers(init?.headers || {});
      body = init?.body ?? undefined;
    } else {
      // Request object — clone to preserve body
      urlStr = input.url;
      const cloned = input.clone();
      headers = new Headers(cloned.headers);
      body = await cloned.text().then(t => t || undefined).catch(() => undefined);
    }

    // Determine if this is an API call that needs auth
    const isApiCall = urlStr.startsWith('/') ||
      urlStr.includes('infinitelearningstudent.id') ||
      urlStr.includes('localhost:7000');

    if (token && isApiCall) {
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return originalFetch(urlStr, {
        ...init,
        headers,
        body,
        credentials: 'include',
      });
    }

    return originalFetch(input, init);
  };

  // Mark as patched to prevent double-patching on HMR
  (patchedFetch as any).__patched = true;
  window.fetch = patchedFetch;
}
