const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

const replyRegex = /await updateDoc\(postRef, \{\n      replies: arrayUnion\(newReply\),\n      secretPasskey: "wej-blog-backend-secret-authorized-2026",\n      updatedAt: serverTimestamp\(\),\n    \}\);\n\n    res\.json\(\{ success: true, reply: newReply \}\);/;

code = code.replace(replyRegex, `await updateDoc(postRef, {\n      replies: arrayUnion(newReply),\n      secretPasskey: "wej-blog-backend-secret-authorized-2026",\n      updatedAt: serverTimestamp(),\n    });\n    notifyAdmin(\n      \`Nouvelle réponse sur le Blog Grand Line\`,\n      \`\${newReply.authorName} (\${newReply.authorEmail}) a répondu à un message.\\n\\nRéponse : \${newReply.content}\`\n    );\n    res.json({ success: true, reply: newReply });`);

fs.writeFileSync('api/index.ts', code, 'utf8');
console.log("Patched api/index.ts again");
