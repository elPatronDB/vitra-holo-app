import https from 'https';

const apiKey = process.env.VITE_GEMINI_API_KEY || "AIzaSyBNVXMKq8eqi1RPrctIt9rRkcKht3PRNMI";

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const payload = JSON.stringify({
  contents: [
    {
      parts: [
        {
          text: "Say hello!"
        }
      ]
    }
  ]
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
      console.log("Gemini text model response:", JSON.stringify(json, null, 2));
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
