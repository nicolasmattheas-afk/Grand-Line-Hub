const https = require('https');

const queryData = JSON.stringify({
  structuredQuery: {
    from: [{ collectionId: "users" }],
    orderBy: [{ field: { fieldPath: "bounty" }, direction: "DESCENDING" }],
    limit: 3
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
    const users = [];
    
    json.forEach(item => {
      if (item.document) {
        const fields = item.document.fields;
        let lastLogTime = "No logs";
        if (fields.logs && fields.logs.arrayValue && fields.logs.arrayValue.values && fields.logs.arrayValue.values.length > 0) {
            const logs = fields.logs.arrayValue.values;
            const firstLog = logs[0].mapValue.fields;
            lastLogTime = firstLog.timestamp ? firstLog.timestamp.stringValue : "Unknown log time";
        }
        
        users.push({
          username: fields.username?.stringValue,
          email: fields.email?.stringValue,
          bounty: fields.bounty?.integerValue || fields.bounty?.doubleValue,
          updatedAt: fields.updatedAt?.timestampValue || "Unknown",
          lastLog: lastLogTime
        });
      }
    });
    
    console.table(users);
  });
});

req.write(queryData);
req.end();
