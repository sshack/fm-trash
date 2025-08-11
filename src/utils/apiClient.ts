function buildUrl(input: RequestInfo): RequestInfo {
  // Allow absolute URLs to pass through
  if (typeof input !== 'string') return input;
  if (/^https?:\/\//i.test(input)) return input;

  let base = process.env.NEXT_PUBLIC_APP_API_URL || '';
  if (!/^https?:\/\//i.test(base)) {
    base = `http://${base}`;
  }
  // Remove trailing slash from base and ensure single leading slash on path
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  const path = input.startsWith('/') ? input : `/${input}`;
  return `${base}${path}`;
}

async function fetchWithToken(input: RequestInfo, init?: RequestInit) {
  const accessToken = localStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'ngrok-skip-browser-warning': 'true', // Add this line
    'Content-Type': 'application/json', // Good practice to include
  };

  if (init?.headers) {
    Object.assign(headers, init.headers);
  }

  return fetch(buildUrl(input), {
    ...init,
    headers,
  });
}

export default fetchWithToken;
