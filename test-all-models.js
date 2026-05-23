import https from 'https';

const apiKey = process.env.VITE_GEMINI_API_KEY || "AIzaSyBNVXMKq8eqi1RPrctIt9rRkcKht3PRNMI";

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("All Available Models:");
        json.models.forEach(m => {
          console.log(`- ${m.name} (${m.displayName}) - Methods: ${JSON.stringify(m.supportedGenerationMethods)}`);
        });
      } else {
        console.log("Response:", JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.error("Parse error:", e);
      console.log("Raw output:", data);
    }
  });
}).on('error', (e) => {
  console.error("HTTP Error:", e);
});
