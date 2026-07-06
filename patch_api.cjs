const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

const importRegex = /import dotenv from "dotenv";/;
code = code.replace(importRegex, `import dotenv from "dotenv";\nimport nodemailer from "nodemailer";\n\nconst transporter = nodemailer.createTransport({\n  host: process.env.SMTP_HOST || "smtp.gmail.com",\n  port: Number(process.env.SMTP_PORT) || 587,\n  secure: false,\n  auth: {\n    user: process.env.SMTP_USER,\n    pass: process.env.SMTP_PASS,\n  },\n});\n\nconst ADMIN_EMAIL = "nicolasmattheas@gmail.com";\n\nfunction notifyAdmin(subject, text) {\n  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {\n    console.warn("SMTP credentials not set, email will not be sent:", subject);\n    return;\n  }\n  transporter.sendMail({\n    from: process.env.SMTP_USER,\n    to: ADMIN_EMAIL,\n    subject: subject,\n    text: text\n  }).catch(e => console.error("Email send failed:", e));\n}`);

const createRegex = /await setDoc\(newPostRef, newPost\);\n    res\.json\(\{ success: true, postId: newPostRef\.id, post: newPost \}\);/;
code = code.replace(createRegex, `await setDoc(newPostRef, newPost);\n    notifyAdmin(\n      \`Nouveau \${newPost.type === 'bug' ? 'Bug' : 'Message'} sur le Blog Grand Line\`, \n      \`\${newPost.authorName} (\${newPost.authorEmail}) a publié :\\n\\nTitre: \${newPost.title}\\n\\nMessage: \${newPost.content}\`\n    );\n    res.json({ success: true, postId: newPostRef.id, post: newPost });`);

const replyRegex = /await updateDoc\(postRef, \{\n      replies: arrayUnion\(newReply\),\n      updatedAt: serverTimestamp\(\),\n    \}\);\n    res\.json\(\{ success: true, replyId, reply: newReply \}\);/;
code = code.replace(replyRegex, `await updateDoc(postRef, {\n      replies: arrayUnion(newReply),\n      updatedAt: serverTimestamp(),\n    });\n    notifyAdmin(\n      \`Nouvelle réponse sur le Blog Grand Line\`,\n      \`\${newReply.authorName} (\${newReply.authorEmail}) a répondu à un message.\\n\\nRéponse : \${newReply.content}\`\n    );\n    res.json({ success: true, replyId, reply: newReply });`);

fs.writeFileSync('api/index.ts', code, 'utf8');
console.log("Patched api/index.ts");
