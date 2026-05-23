import https from 'https';

const apiKey = process.env.VITE_GEMINI_API_KEY || "AIzaSyBNVXMKq8eqi1RPrctIt9rRkcKht3PRNMI";

if (!apiKey) {
  console.error("No API key provided.");
  process.exit(1);
}

// Let's test imagen-3.0-generate-002 or imagen-4.0-generate-001. 
// Since test-models showed 'imagen-4.0-generate-001' is available, let's use it!
const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

const payload = JSON.stringify({
  instances: [
    {
      prompt: "A neon skull on a solid black background, minimalist 3d model render"
    }
  ],
  parameters: {
    numberOfImages: 1,
    aspectRatio: "1:1",
    outputMimeType: "image/jpeg"
  }
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = https.request(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error("API Error:", json.error);
        return;
      }
      if (json.predictions && json.predictions.length > 0) {
        const base64Str = json.predictions[0].bytesBase64Encoded;
        console.log("Success! Generated image base64 length:", base64Str.length);
        console.log("Sample base64:", base64Str.substring(0, 100));
      } else {
        console.error("No predictions returned:", JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.error("Parse error:", e);
      console.log("Raw output:", data);
    }
  });
});

req.on('error', (e) => {
  console.error("HTTP Request Error:", e);
});

req.write(payload);
req.end();
