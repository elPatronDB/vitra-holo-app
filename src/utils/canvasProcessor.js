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
  const IMAGE_SIZE = 320; // Size of each projection view
  const CENTER_OFFSET = 230; // Distance of each projection view center from the canvas center

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context");
  }

  // 1. Fill canvas with solid black (#000000) for ideal hologram display
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // 2. Load the source image
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Enable CORS loading for fallback URLs
  img.src = baseImageSrc;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = (e) => reject(new Error("Fallo al cargar la imagen base para procesar el canvas"));
  });

  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;

  // 3. Define the 4 views (South, North, West, East)
  // The top of the image in each view faces the center (cx, cy)
  const views = [
    { name: 'South', x: cx, y: cy + CENTER_OFFSET, angle: 0 },
    { name: 'North', x: cx, y: cy - CENTER_OFFSET, angle: 180 },
    { name: 'West', x: cx - CENTER_OFFSET, y: cy, angle: 90 },
    { name: 'East', x: cx + CENTER_OFFSET, y: cy, angle: 270 }
  ];

  // 4. Draw each of the rotated views
  views.forEach((view) => {
    ctx.save();
    // Move to the position where this view should be centered
    ctx.translate(view.x, view.y);
    // Rotate around the view center
    ctx.rotate((view.angle * Math.PI) / 180);
    // Draw the image centered at (0, 0)
    ctx.drawImage(img, -IMAGE_SIZE / 2, -IMAGE_SIZE / 2, IMAGE_SIZE, IMAGE_SIZE);
    ctx.restore();
  });

  // 5. Add a subtle, high-tech calibration ring in the exact center
  // This helps the user perfectly align their physical plastic pyramid.
  // It is styled in a very dim cyan to keep the hologram contrast clean.
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
  ctx.lineWidth = 1.5;
  
  // Outer dashed circle
  ctx.beginPath();
  ctx.arc(cx, cy, 35, 0, 2 * Math.PI);
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  
  // Inner solid micro-circle (tiny center anchor)
  ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI);
  ctx.fill();

  // 6. Convert canvas to PNG Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};
