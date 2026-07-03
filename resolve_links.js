const https = require('https');

const urls = [
  "https://amzn.to/4vlc00U",
  "https://amzn.to/4fie2d2"
];

async function getRedirectUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(res.headers.location);
      } else {
        resolve(url);
      }
    }).on('error', err => reject(err));
  });
}

async function run() {
  for (const url of urls) {
    try {
      const loc = await getRedirectUrl(url);
      console.log(`${url} -> ${loc}`);
      const match = loc.match(/\/dp\/([A-Z0-9]{10})/);
      if (match) {
        console.log(`ASIN: ${match[1]}`);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

run();
