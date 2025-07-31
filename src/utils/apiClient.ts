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
  if (init?.headers) {
    (init.headers as Record<string, string>)[
      'Authorization'
    ] = `Bearer ${accessToken}`;
  } else {
    init = {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
  return fetch(buildUrl(input), init);
}

export default fetchWithToken;
