/**
 * Service to simulate AI Image Generation using curated premium stock 3D assets on solid black backgrounds.
 * Bypasses all CORS issues by downloading the assets as local Blob URLs.
 */

// Curated library of 3D objects with solid black/dark backgrounds
const CURATED_STYLE_PRESETS = {
  'Cyberpunk': [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800', // Neon room
    'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&q=80&w=800', // Cyber helmet
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800'  // Glowing cyber portal
  ],
  'Realista': [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800', // Real estate model
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800', // Camera drone
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'  // Clean athletic model shoe
  ],
  'Abstracto': [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', // Floating minimalist waves
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800', // Elegant glowing sphere
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800'  // Neon fluid art
  ],
  'Minimalista': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', // Minimalist villa model
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800', // Minimalist white designer chair
    'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=800'  // Geometric ceramic vase
  ]
};

/**
 * Simulates the generation of an AI image using curated stock images.
 * Fetches the image as a Blob to guarantee CORS compatibility for HTML5 Canvas.
 * 
 * @param {string} userPrompt - The user prompt (for realistic log tracing).
 * @param {string} style - The selected style (Cyberpunk, Realista, Abstracto, Minimalista).
 * @returns {Promise<{ success: boolean, imageUrl: string, isFallback: boolean }>}
 */
export const generateBaseImage = async (userPrompt, style = 'Cyberpunk') => {
  console.log(`[Simulación IA] Procesando prompt: "${userPrompt}" en estilo: ${style}`);
  
  // 1. Simular retraso realista de red y procesamiento de la IA (1.5 segundos)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 2. Obtener lista de imágenes para el estilo o fallback
  const images = CURATED_STYLE_PRESETS[style] || CURATED_STYLE_PRESETS['Cyberpunk'];
  
  // 3. Seleccionar una imagen al azar de la lista
  const randomIndex = Math.floor(Math.random() * images.length);
  const targetUrl = images[randomIndex];

  try {
    // 4. Descargar la imagen como un Blob local
    // Unsplash soporta CORS nativamente en su CDN, por lo que el fetch funciona perfectamente
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error("Fallo al descargar la plantilla de la simulación");

    const blob = await response.blob();
    const localBlobUrl = URL.createObjectURL(blob);

    return {
      success: true,
      imageUrl: localBlobUrl,
      isFallback: false
    };
  } catch (error) {
    console.warn("Fallo al descargar la imagen por fetch, retornando URL directa como respaldo:", error);
    return {
      success: true,
      imageUrl: targetUrl,
      isFallback: true
    };
  }
};
