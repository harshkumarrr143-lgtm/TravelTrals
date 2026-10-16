// Cloudinary Image Upload Service for TravelTales
// Handles client-side unsigned image uploads directly to Cloudinary

const CLOUDINARY_STORAGE_KEY = 'traveltales_cloudinary_config';

// Default configuration with fallback or user-saved settings
export const defaultCloudinaryConfig = {
  cloudName: import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || 'dtbgjhtm',
  uploadPreset: import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'traveltales_upload'
};

export function getCloudinaryConfig() {
  try {
    const saved = localStorage.getItem(CLOUDINARY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudName && parsed.uploadPreset) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cloudinary config:', e);
  }
  return defaultCloudinaryConfig;
}

export function saveCloudinaryConfig(config) {
  try {
    localStorage.setItem(CLOUDINARY_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error saving cloudinary config:', e);
    return false;
  }
}

export function isCloudinaryConfigured() {
  const config = getCloudinaryConfig();
  return Boolean(config.cloudName && config.uploadPreset);
}

/**
 * Uploads a local image file directly to Cloudinary using unsigned upload preset
 * @param {File} file - The file from <input type="file">
 * @param {Function} [onProgress] - Optional callback(percent)
 * @returns {Promise<{success: boolean, url: string, publicId?: string, error?: string}>}
 */
export async function uploadImageToCloudinary(file, onProgress = null) {
  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.uploadPreset) {
    throw new Error(
      'Cloudinary is not configured yet! Please enter your Cloud Name and Unsigned Upload Preset in the Cloudinary Settings or .env file.'
    );
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', 'traveltales_profiles');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            bytes: response.bytes
          });
        } catch (e) {
          reject(new Error('Invalid response from Cloudinary.'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading image to Cloudinary. Check your internet connection.'));
    };

    xhr.send(formData);
  });
}

/**
 * Automatically applies face-detection and square cropping to Cloudinary image URLs
 * @param {string} url - Cloudinary image URL
 * @returns {string} - Optimized URL with c_fill,g_face,w_400,h_400
 */
export function formatCloudinaryAvatarUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/image/upload/') && !url.includes('c_fill') && !url.includes('c_thumb')) {
    return url.replace('/image/upload/', '/image/upload/c_fill,g_face,w_400,h_400,q_auto/');
  }
  return url;
}

