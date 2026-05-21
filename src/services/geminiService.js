/**
 * Service to interact with the Google Gemini API (Imagen 3) for Image Generation.
 */

// Elegant premium stock images as fallback.
// These are carefully curated CORS-compliant images that represent 3D models with dark/black backgrounds
const MOCK_STYLE_IMAGES = {
  'Cyberpunk': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800', // Glowing anime/synthwave room
  'Realista': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',   // Real estate architecture model
  'Abstracto': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',  // Beautiful minimalist 3D geometric abstract
  'Minimalista': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' // Minimalist modern villa architecture
};

const STYLE_PROMPT_MODIFIERS = {
  'Cyberpunk': 'futuristic cyberpunk aesthetic, glowing neon elements, high-tech cybernetic details, synthwave color palette, luminous wireframe accents, dark synthetic tones',
  'Realista': 'ultra-realistic photorealistic 3D render, PBR materials, fine textures, highly detailed, real-world studio lighting, crisp shadows',
  'Abstracto': 'surreal abstract art, vibrant contrasting colors, fluid organic shapes, glowing particles, artistic composition, floating surreal geometry',
  'Minimalista': 'clean minimalist design, elegant simple geometry, architectural model style, low-poly aesthetic, sleek design, matte finish'
};

/**
 * Generates a base image using the Gemini Imagen 3 model.
 * Falls back to high-quality stock images if the API key is missing or calls fail.
 * 
 * @param {string} userPrompt - The core prompt from the user.
 * @param {string} style - The selected style (Cyberpunk, Realista, Abstracto, Minimalista).
 * @returns {Promise<{ success: boolean, imageUrl: string, isFallback: boolean, error?: string }>}
 */
export const generateBaseImage = async (userPrompt, style = 'Cyberpunk') => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY not found in environment. Using high-quality mock fallback.");
    return {
      success: true,
      imageUrl: MOCK_STYLE_IMAGES[style] || MOCK_STYLE_IMAGES['Cyberpunk'],
      isFallback: true,
      error: "API Key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY a .env.local para generación real."
    };
  }

  // Engineering the perfect prompt for holograms:
  // 1. MUST have a solid black background (#000000).
  // 2. Object must be centered and isolated (no floor, no ceiling, no surrounding environment).
  // 3. Modifiers for the selected style.
  const styleModifier = STYLE_PROMPT_MODIFIERS[style] || STYLE_PROMPT_MODIFIERS['Cyberpunk'];
  const optimizedPrompt = `A highly detailed, isolated 3D model of ${userPrompt}, perfectly centered in the frame. Captured from a studio perspective. Solid pure pitch-black background (#000000) only. No ground floor, no horizon line, no shadow on the floor, no text, no watermarks, studio lighting, hologram-ready, cinematic, ${styleModifier}.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: optimizedPrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/png"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    
    if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
      const base64Data = data.predictions[0].bytesBase64Encoded;
      return {
        success: true,
        imageUrl: `data:image/png;base64,${base64Data}`,
        isFallback: false
      };
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Gemini Imagen 3 Generation failed. Using fallback:", error);
    return {
      success: true,
      imageUrl: MOCK_STYLE_IMAGES[style] || MOCK_STYLE_IMAGES['Cyberpunk'],
      isFallback: true,
      error: `Error de API: ${error.message}. Usando fallback de demostración.`
    };
  }
};
