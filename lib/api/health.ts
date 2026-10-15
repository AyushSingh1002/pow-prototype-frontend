import { BackendHealthResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Check backend health */
export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  const res = await fetch(`${getApiBase()}/api/health`, {
    cache: 'no-store',
  });
  return handleResponse<BackendHealthResponse>(res);
}
