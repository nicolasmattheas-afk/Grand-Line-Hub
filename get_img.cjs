const https = require('https');
const zlib = require('zlib');

async function getImg(asin) {
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

        const match = data.match(/hiRes" *: *"([^"]+)"/);
        if (match) {
          resolve(match[1]);
        } else {
            const match2 = data.match(/large" *: *"([^"]+)"/);
            if (match2) resolve(match2[1]);
            else {
                const match3 = data.match(/<img[^>]+id="landingImage"[^>]+src="([^"]+)"/);
                resolve(match3 ? match3[1] : null);
            }
        }
      });
    });
  });
}

(async () => {
  const asins = [
    "B07YZM1YS4",
    "B0DZXT7GQH",
    "B0G36C7FF1",
    "B0DZXQLL5D",
    "B0GPR6F2SC",
    "B0DYK7N5LN",
    "B09B2ZVPVW"
  ];
  for (const asin of asins) {
    const img = await getImg(asin);
    console.log(`${asin}: ${img}`);
  }
})();
