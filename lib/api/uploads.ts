import { UploadMetadataResponse } from '../../types/api.types';
import { getApiBase, handleResponse } from './client';

/** Register artwork upload metadata */
export async function registerArtworkUpload(payload: {
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  quoteId?: string;
  orderId?: string;
}): Promise<UploadMetadataResponse> {
  const res = await fetch(`${getApiBase()}/api/demo/uploads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<UploadMetadataResponse>(res);
}
