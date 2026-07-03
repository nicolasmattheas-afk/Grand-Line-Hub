const fs = require('fs');
const https = require('https');

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
      var num = parseInt(numStr, 10); // read num as normal number
      return String.fromCharCode(num);
  }).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
}

async function run() {
  let code = fs.readFileSync('src/components/Boutique.tsx', 'utf8');
  const regex = /{ id: "(f_\d+)", name: "([^"]+)", category: "produits dérivés", link: "([^"]+)", image: "https:\/\/m\.media-amazon\.com\/images\/P\/([A-Z0-9]+)\./g;
  
  let newCode = code;
  let match;
  let replacements = [];

  while ((match = regex.exec(code)) !== null) {
    const fullMatch = match[0];
    const id = match[1];
    const currentName = match[2];
    const link = match[3];
    const asin = match[4];

    console.log(`Fetching title for ASIN: ${asin} (${id})`);
    let title = await fetchTitle(asin);
    if (title) {
      // Decode HTML entities
      title = decodeHtml(title);
      // Clean title
      title = title.replace(/\s*: Amazon\.fr.*$/i, '');
      title = title.replace(/\s*Amazon\.fr.*$/i, '');
      // Remove specific words as requested by user
      title = title.replace(/Plastoy/gi, '');
      title = title.replace(/PVC/gi, '');
      title = title.replace(/\b\d+\s*cm\b/gi, '');
      title = title.replace(/\b\d+cm\b/gi, ''); // no space cm
      title = title.replace(/\b\d+\s*mm\b/gi, ''); // remove mm as well? just in case
      title = title.replace(/Standard Polyrésine/gi, '');
      // Cleanup spaces
      title = title.replace(/\s+/g, ' ').trim();
      
      // If it ends up empty, fallback to something
      if (!title || title.length < 2) title = currentName;

      console.log(`  -> ${title}`);
      
      const newMatchStr = `{ id: "${id}", name: "${title}", category: "produits dérivés", link: "${link}", image: "https://m.media-amazon.com/images/P/${asin}.`;
      replacements.push({ oldStr: fullMatch, newStr: newMatchStr });
    }
  }

  for (const rep of replacements) {
    newCode = newCode.replace(rep.oldStr, rep.newStr);
  }

  fs.writeFileSync('src/components/Boutique.tsx', newCode);
  console.log("Done updating titles.");
}

run();
