const https = require('https');

const queryData = JSON.stringify({
  structuredQuery: {
    from: [{ collectionId: "users" }],
    where: {
      fieldFilter: {
        field: { fieldPath: "email" },
        op: "EQUAL",
        value: { stringValue: "coradax.games@gmail.com" }
      }
    }
  }
});

const options = {
  hostname: 'firestore.googleapis.com',
  path: '/v1/projects/sonic-digit-rrwfn/databases/ai-studio-f76be963-54c1-43b1-9fdf-2c29f3e7408e/documents:runQuery',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': queryData.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    if (!json || !json[0] || !json[0].document) {
      console.log("User not found");
      return;
    }
    const docPath = json[0].document.name;
    const currentBounty = parseInt(json[0].document.fields.bounty.integerValue, 10);
    const newBounty = currentBounty - 140000000;
    
    const patchData = JSON.stringify({
      fields: {
        bounty: { integerValue: Math.max(0, newBounty) }
      }
    });
    
    const patchPath = '/v1/' + docPath + '?updateMask.fieldPaths=bounty';
    
    const patchOptions = {
      hostname: 'firestore.googleapis.com',
      path: patchPath,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': patchData.length
      }
    };
    
    const patchReq = https.request(patchOptions, patchRes => {
      let pBody = '';
      patchRes.on('data', chunk => pBody += chunk);
      patchRes.on('end', () => {
        console.log(`Success! Current: ${currentBounty} -> New: ${Math.max(0, newBounty)}`);
      });
    });
    
    patchReq.write(patchData);
    patchReq.end();
  });
});

req.write(queryData);
req.end();
