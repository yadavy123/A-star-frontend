import axios from 'axios';
import { getMediaSignature } from '../api/api/answerApi';

function getEnvCloudName() {
  try { return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; } catch { return undefined; }
}

function getEnvUploadPreset() {
  try { return import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; } catch { return undefined; }
}

/**
 * Uploads a file directly to Cloudinary.
 * Tries backend-signed upload first; falls back to unsigned upload
 * if the signature endpoint fails or returns missing credentials
 * (requires VITE_CLOUDINARY_CLOUD_NAME & VITE_CLOUDINARY_UPLOAD_PRESET env vars).
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} - The URL of the uploaded resource.
 */
export const uploadToCloudinary = async (file) => {
  try {
    return await signedUpload(file);
  } catch (signedError) {
    const cloudName = getEnvCloudName();
    const uploadPreset = getEnvUploadPreset();

    if (cloudName && uploadPreset) {
      return await unsignedUpload(file, cloudName, uploadPreset);
    }

    console.error('Cloudinary upload error:', signedError);
    throw new Error(signedError?.response?.data?.error?.message || 'Failed to upload media. Please try again.');
  }
};

async function signedUpload(file) {
  const signatureData = await getMediaSignature();
  const signature = signatureData?.signature || signatureData?.sig;
  const timestamp = signatureData?.timestamp;
  const cloud_name = signatureData?.cloud_name || signatureData?.cloudName;
  const api_key = signatureData?.api_key || signatureData?.apiKey;
  const folder = signatureData?.folder;

  if (!cloud_name || !api_key) {
    throw { response: { status: 0, data: { error: { message: 'Cloudinary credentials missing from server response' } } } };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  if (folder) formData.append('folder', folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;
  const response = await axios.post(uploadUrl, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.secure_url;
}

async function unsignedUpload(file, cloudName, uploadPreset) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const response = await axios.post(uploadUrl, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.secure_url;
}
