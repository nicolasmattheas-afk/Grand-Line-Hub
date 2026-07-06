import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, doc, query, where } from "firebase/firestore";
import firebaseConfig from "./src/firebase-config-static.js";

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

async function run() {
  const q = query(collection(db, "users"), where("username", "==", "JOJODL"));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log("No user found with username JOJODL");
  } else {
    snap.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
    });
  }
}
run();
