export default function fetchWithToken(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const opts: RequestInit = {
    credentials: 'include',
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  };
  return fetch(input, opts);
}
