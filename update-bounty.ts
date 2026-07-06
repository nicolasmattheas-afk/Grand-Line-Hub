import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const usersSnap = await getDocs(collection(db, 'users'));
  let count = 0;
  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    try {
      await updateDoc(doc(db, 'users', docSnap.id), {
        bounty: (data.bounty || 0) + 150000
      });
      console.log(`Updated ${docSnap.id} with +150,000`);
      count++;
    } catch (e) {
      console.error(`Failed to update ${docSnap.id}`, e);
    }
  }
  console.log(`Successfully updated ${count} users.`);
  process.exit(0);
}
run();
