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
    const fields = json[0].document.fields;
    if (fields.logs && fields.logs.arrayValue && fields.logs.arrayValue.values) {
        console.log("\nAll Logs:");
        fields.logs.arrayValue.values.forEach(log => {
            const l = log.mapValue.fields;
            console.log(`- ${l.timestamp?.stringValue} | ${l.gameType?.stringValue} | ${l.result?.stringValue} | ${l.adjustment?.stringValue}`);
        });
    } else {
        console.log("No logs found.");
    }
  });
});

req.write(queryData);
req.end();
