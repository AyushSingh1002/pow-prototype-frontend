import { UploadMetadataResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Register artwork upload metadata */
export async function registerArtworkUpload(payload: {
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  slotId: string;
  quoteId?: string;
  orderId?: string;
  token?: string;
}): Promise<UploadMetadataResponse> {
  const isProduction = Boolean(payload.token);
  const target = isProduction
    ? await fetch(`${getApiBase()}/api/uploads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          originalFilename: payload.originalFilename,
          mimeType: payload.mimeType,
          sizeBytes: payload.sizeBytes,
          slotId: payload.slotId,
          quoteId: payload.quoteId,
        }),
      })
    : await fetch(`${getApiBase()}/api/demo/uploads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
  return handleResponse<UploadMetadataResponse>(target);
}

export async function uploadArtworkFile(
  uploadUrl: string,
  file: File,
  mimeType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Secure artwork storage rejected the upload (HTTP ${response.status}).`);
  }
}

export async function completeArtworkUpload(
  fileId: string,
  token: string
): Promise<{ fileId: string; status: string; preflight?: UploadMetadataResponse['preflight'] }> {
  const res = await fetch(`${getApiBase()}/api/uploads/${encodeURIComponent(fileId)}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return handleResponse<UploadMetadataResponse>(res);
}
