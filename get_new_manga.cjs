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

        let img = '';
        const match = data.match(/hiRes" *: *"([^"]+)"/);
        if (match) {
          img = match[1];
        } else {
            const match2 = data.match(/large" *: *"([^"]+)"/);
            if (match2) img = match2[1];
            else {
                const match3 = data.match(/<img[^>]+id="landingImage"[^>]+src="([^"]+)"/);
                if (match3) img = match3[1];
            }
        }
        
        if (!img) {
            const match4 = data.match(/mainUrl" *: *"([^"]+)"/);
            if (match4) img = match4[1];
        }
        
        resolve({ title, img });
      });
    });
  });
}

function decodeHtml(html) {
  return html.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  }).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
}

(async () => {
  const asins = ["2723470350", "2723479005"];
  for (const asin of asins) {
    const res = await getTitleAndImg(asin);
    let title = res.title;
    title = decodeHtml(title);
    title = title.replace(/\s*: Amazon\.fr.*$/i, '');
    title = title.replace(/\s*Amazon\.fr.*$/i, '');
    title = title.replace(/\s+/g, ' ').trim();
    console.log(`${asin}: ${title}`);
    console.log(`${asin} image: ${res.img}`);
  }
})();
