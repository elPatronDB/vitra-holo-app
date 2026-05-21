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
  const CANVAS_SIZE = 1024;
  const HALF_SIZE = CANVAS_SIZE / 2;
  const IMG_MAX_SIZE = CANVAS_SIZE / 3.5; // Slightly smaller to fit well

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

  if (width > IMG_MAX_SIZE || height > IMG_MAX_SIZE) {
    if (width > height) {
      height = (height / width) * IMG_MAX_SIZE;
      width = IMG_MAX_SIZE;
    } else {
      width = (width / height) * IMG_MAX_SIZE;
      height = IMG_MAX_SIZE;
    }
  }

  // Create canvas strictly for the 4-sided layout
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context");
  }

  // Pitch black background is strictly required for holographic pyramids
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Helper to draw the image rotated at a specific anchor point
  const drawRotated = (rotationDegrees, x, y) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotationDegrees * Math.PI) / 180);
    // Draw centered on the translated point
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  };

  const offset = CANVAS_SIZE / 5.5; // Distance from the edges

  // Top Face (Top pointing down)
  drawRotated(180, HALF_SIZE, offset);
  
  // Bottom Face (Top pointing up)
  drawRotated(0, HALF_SIZE, CANVAS_SIZE - offset);
  
  // Left Face (Top pointing right)
  drawRotated(90, offset, HALF_SIZE);
  
  // Right Face (Top pointing left)
  drawRotated(-90, CANVAS_SIZE - offset, HALF_SIZE);

  // Convert canvas to WEBP Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/webp', 0.90);
  });
};
