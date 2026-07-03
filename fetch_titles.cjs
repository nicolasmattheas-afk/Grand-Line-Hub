const https = require('https');

const asins = [
  "B07YZM1YS4",
  "B0DZXT7GQH",
  "B0G36C7FF1",
  "B0DZXQLL5D",
  "B0GPR6F2SC",
  "B0DYK7N5LN",
  "B09B2ZVPVW"
];

async function fetchTitle(asin) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.amazon.fr/dp/${asin}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const match = data.match(/<title>([^<]+)<\/title>/i);
        if (match) {
          resolve(match[1]);
        } else {
          resolve('');
        }
      });
    }).on('error', err => resolve(''));
  });
}

function decodeHtml(html) {
  return html.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  }).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
}

async function run() {
  for (const asin of asins) {
    let title = await fetchTitle(asin);
    if (title) {
      title = decodeHtml(title);
      title = title.replace(/\s*: Amazon\.fr.*$/i, '');
      title = title.replace(/\s*Amazon\.fr.*$/i, '');
      title = title.replace(/Plastoy/gi, '');
      title = title.replace(/PVC/gi, '');
      title = title.replace(/\b\d+\s*cm\b/gi, '');
      title = title.replace(/\b\d+cm\b/gi, '');
      title = title.replace(/\b\d+\s*mm\b/gi, '');
      title = title.replace(/Standard Polyrésine/gi, '');
      title = title.replace(/\s+/g, ' ').trim();
      console.log(`${asin}: ${title}`);
    } else {
      console.log(`${asin}: NOT FOUND`);
    }
  }
}

run();
