type ApiFetchOptions = RequestInit & { token?: string | null };

export async function apiFetch<T>(
  path: string,
  { token, ...options }: ApiFetchOptions = {},
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
