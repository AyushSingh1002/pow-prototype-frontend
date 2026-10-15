import { ApiErrorShape } from '../../types/api.types';

export const getApiBase = (): string => {
  // In the browser, relative calls to /api will be routed through Next.js rewrite proxy
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:5000';
};

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorJson: ApiErrorShape | null = null;
    try {
      errorJson = await res.json();
    } catch {
      // response is not JSON
    }
    const message = errorJson?.error?.message || `Request failed with status ${res.status}`;
    const code = errorJson?.error?.code || 'HTTP_ERROR';
    const error = new Error(message) as Error & {
      code?: string;
      details?: any;
      requestId?: string;
      status: number;
    };
    error.code = code;
    error.details = errorJson?.error?.details;
    error.requestId = errorJson?.error?.requestId;
    error.status = res.status;
    throw error;
  }
  return res.json();
}
