import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, updateDoc } from "firebase/firestore";
import firebaseConfig from "./src/firebase-config-static.js";

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

async function run() {
  const userId = "jojodel574@gmail.com";
  // Increment bounty by 5 million
  await updateDoc(doc(db, "users", userId), {
    bounty: 50030000 + 5000000 
  });
  console.log(`Updated bounty for ${userId} from 50,030,000 to 55,030,000`);
}
run();
