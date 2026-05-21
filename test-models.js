import https from 'https';

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API key provided. Set VITE_GEMINI_API_KEY");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const imagenModels = json.models.filter(m => m.name.toLowerCase().includes('imagen'));
      console.log("Found Imagen Models:", JSON.stringify(imagenModels, null, 2));
    } catch (e) {
      console.error("Parse error:", e);
      console.log("Raw output:", data);
    }
  });
}).on('error', (e) => {
  console.error("HTTP Error:", e);
});
