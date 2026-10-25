type ApiResult<T> = {
  data: T;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResult<T>> {
  const response = await fetch(path, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Request failed';
    throw new Error(message);
  }

  return { data: (payload ?? {}) as T };
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
};

export type AuthUser = {
  userId: string;
  email?: string;
  name?: string;
  scope: string;
};

export const auth = {
  async getUser(): Promise<AuthUser | null> {
    return null;
  },
  async signIn(): Promise<void> {
    throw new Error('Sign-in is not configured for this deployment.');
  },
  async signOut(): Promise<void> {
    return;
  },
};
