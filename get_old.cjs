const https = require('https');
const zlib = require('zlib');
async function getTitleAndImg(asin) {
  return new Promise((resolve) => {
    https.get(`https://www.amazon.fr/dp/${asin}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        let buffer = Buffer.concat(chunks);
        let data = '';
        if (res.headers['content-encoding'] === 'gzip') {
          data = zlib.gunzipSync(buffer).toString();
        } else if (res.headers['content-encoding'] === 'br') {
          data = zlib.brotliDecompressSync(buffer).toString();
        } else if (res.headers['content-encoding'] === 'deflate') {
          data = zlib.inflateSync(buffer).toString();
        } else {
          data = buffer.toString();
        }
        let title = '';
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) title = titleMatch[1];
        resolve({ title });
      });
    });
  });
}
getTitleAndImg("2723450252").then(r => console.log(r));
