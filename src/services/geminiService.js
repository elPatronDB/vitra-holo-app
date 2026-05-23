/**
 * Service to integrate Google Generative AI Imagen 4.0 for real-time image generation
 * with a robust fallback to Pollinations AI to generate real prompt-based images when
 * Google API limits/credits are reached.
 */

// Curated library of 3D objects with solid black/dark backgrounds as high-fidelity fallback presets
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
 * Helper to convert a Base64 string into a binary Blob URL.
 * Necessary for standard HTML5 Canvas compatibility (avoids CORS blockages).
 * 
 * @param {string} base64 - Base64 encoded image string
 * @param {string} mimeType - Output file format
 * @returns {Blob}
 */
function base64ToBlob(base64, mimeType = 'image/jpeg') {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Executes a real call to Google Generative AI Imagen 4.0.
 * If the key has depleted credits (429) or fails for any reason, it triggers the fallback simulation.
 * 
 * @param {string} userPrompt - User prompt
 * @param {string} style - Art style selected
 * @returns {Promise<{ success: boolean, imageUrl: string, isFallback: boolean, fallbackReason: (string|undefined) }>}
 */
export const generateBaseImage = async (userPrompt, style = 'Cyberpunk') => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[Gemini API] No VITE_GEMINI_API_KEY detected in .env.local. Initializing prompt-based simulation fallback.");
    return await executeFallbackSimulation(userPrompt, style, "API Key Missing");
  }

  // Optimize prompt specifically for physical holographic reflections:
  // - Solid black background is absolute requirement to avoid reflections on glass.
  // - 3D asset style for floating spatial sensation.
  const optimizedPrompt = `${userPrompt}, style: ${style}, 3D digital asset floating on a solid black background (#000000), pitch black background, centered composition, high-contrast studio rendering, vivid neon colors, no borders, no text`;

  console.log(`[Gemini API] Querying Imagen 4.0 with optimized prompt: "${optimizedPrompt}"`);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: optimizedPrompt
          }
        ],
        parameters: {
          numberOfImages: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/jpeg"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `HTTP status ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.predictions || data.predictions.length === 0) {
      throw new Error("No predictions array returned from Gemini API");
    }

    const base64Encoded = data.predictions[0].bytesBase64Encoded;
    if (!base64Encoded) {
      throw new Error("Image byte data is empty or malformed");
    }

    const imageBlob = base64ToBlob(base64Encoded, 'image/jpeg');
    const localBlobUrl = URL.createObjectURL(imageBlob);

    console.log(`[Gemini API] Imagen 4.0 generated successfully! Length: ${base64Encoded.length} bytes`);

    return {
      success: true,
      imageUrl: localBlobUrl,
      isFallback: false
    };

  } catch (error) {
    console.warn(`[Gemini API] Imagen 4.0 generation failed: ${error.message}. Activating prompt-based fallback simulation.`);
    return await executeFallbackSimulation(userPrompt, style, error.message);
  }
};

/**
 * Fallback simulator using Pollinations AI to generate real prompt-based images on the fly.
 * Bypasses quota/billing issues seamlessly with wildcard CORS headers support.
 * Falls back to static stock presets only if the external image generator is offline.
 * 
 * @private
 */
async function executeFallbackSimulation(userPrompt, style, reason) {
  // Simulate realistic network delay (1.5 seconds) to mimic generative AI model execution
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Build a highly optimized prompt for physical holograms:
  // - Solid black background is absolute requirement to avoid reflections on glass.
  // - 3D asset style for floating spatial sensation.
  const optimizedPrompt = `${userPrompt}, style: ${style}, 3D digital asset floating on a solid black background, pitch black background, centered composition, high-contrast studio rendering, vivid neon colors, no borders, no text`;

  // Call Pollinations AI to generate a custom image on the fly!
  const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

  console.log(`[Simulación IA] Intentando generar imagen real vía Pollinations AI para el prompt: "${userPrompt}"`);

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error("Pollinations AI fetch failed");
    
    const blob = await response.blob();
    const localBlobUrl = URL.createObjectURL(blob);

    console.log(`[Simulación IA] ¡Imagen generada en base al prompt real del usuario con éxito!`);

    return {
      success: true,
      imageUrl: localBlobUrl,
      isFallback: true, // Marked as fallback since we didn't charge the depleted Google Gemini API account
      fallbackReason: reason
    };
  } catch (err) {
    console.warn(`[Simulación IA] Pollinations AI falló: ${err.message}. Usando presets fijos de respaldo.`);
    
    // Absolute fallback to pre-curated presets if offline
    const images = CURATED_STYLE_PRESETS[style] || CURATED_STYLE_PRESETS['Cyberpunk'];
    const randomIndex = Math.floor(Math.random() * images.length);
    const presetUrl = images[randomIndex];

    try {
      const response = await fetch(presetUrl);
      if (!response.ok) throw new Error("Fallback stock fetch failed");
      
      const blob = await response.blob();
      const localBlobUrl = URL.createObjectURL(blob);

      return {
        success: true,
        imageUrl: localBlobUrl,
        isFallback: true,
        fallbackReason: reason + " + " + err.message
      };
    } catch (presetErr) {
      return {
        success: true,
        imageUrl: presetUrl,
        isFallback: true,
        fallbackReason: reason + " + " + err.message + " + " + presetErr.message
      };
    }
  }
}
