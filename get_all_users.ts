import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, doc, query, where } from "firebase/firestore";
import firebaseConfig from "./src/firebase-config-static.js";

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.username && data.username.toLowerCase().includes("jojo")) {
      console.log(doc.id, "=>", data);
    }
  });
}
run();
