/**
 * Utility to process and compose a 4-sided holographic projection layout using HTML5 Canvas.
 */

/**
 * Takes a base image (data URL or standard URL) and draws it rotated 4 times
 * pointing towards the center of a square pitch-black canvas.
 * 
 * @param {string} baseImageSrc - The source image URL or base64 data.
 * @returns {Promise<Blob>} A promise resolving to a PNG Blob of the composed layout.
 */
export const createHolographicLayout = async (baseImageSrc) => {
  const MAX_SIZE = 1024;

  // 1. Load the source image
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Enable CORS loading for fallback URLs
  img.src = baseImageSrc;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Fallo al cargar la imagen base para procesar"));
  });

  // Calculate proportional dimensions
  let width = img.width;
  let height = img.height;

  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width > height) {
      height = (height / width) * MAX_SIZE;
      width = MAX_SIZE;
    } else {
      width = (width / height) * MAX_SIZE;
      height = MAX_SIZE;
    }
  }

  // Create canvas strictly for the scaled image (no fixed black background)
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context");
  }

  // Draw the image exactly as it is (preserves transparency)
  ctx.drawImage(img, 0, 0, width, height);

  // Convert canvas to WEBP Blob (supports transparency, excellent compression)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/webp', 0.90);
  });
};
