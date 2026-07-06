const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
// Ensure we don't accidentally do this if unnecessary, but here no version change requested
