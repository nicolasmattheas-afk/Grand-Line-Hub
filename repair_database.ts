import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import firebaseConfig from "./src/firebase-config-static.js";

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

async function repairDatabase() {
  try {
    console.log("1. Récupération de tous les utilisateurs...");
    const usersSnap = await getDocs(collection(db, "users"));
    const usersMap = new Map<string, any>();
    
    usersSnap.forEach((doc) => {
      usersMap.set(doc.id.toLowerCase().trim(), {
        id: doc.id,
        bounty: Number(doc.data().bounty || 0),
        username: doc.data().username || "Pirate",
        avatar: doc.data().avatar || ""
      });
    });
    console.log(`Nombre d'utilisateurs trouvés : ${usersMap.size}`);

    console.log("\n2. Récupération de tous les équipages...");
    const crewsSnap = await getDocs(collection(db, "crews"));
    console.log(`Nombre d'équipages trouvés : ${crewsSnap.size}`);

    for (const crewDoc of crewsSnap.docs) {
      const crewId = crewDoc.id;
      const crewData = crewDoc.data();
      const crewName = crewData.name || "Équipage sans nom";
      const members = crewData.members || [];
      
      console.log(`\nAnalyse de l'équipage "${crewName}" (${crewId})...`);
      let hasChanged = false;
      let newMembersList = [];
      let totalBountySum = 0;

      for (const member of members) {
        const memberEmail = (member.email || "").toLowerCase().trim();
        const realUserData = usersMap.get(memberEmail);

        if (realUserData) {
          const realBounty = realUserData.bounty;
          const realUsername = realUserData.username;
          const realAvatar = realUserData.avatar;

          if (member.bounty !== realBounty || member.name !== realUsername || member.avatar !== realAvatar) {
            console.log(`  -> Mise à jour du membre [${member.email}] :`);
            console.log(`     Ancien : Nom="${member.name}", Prime=${member.bounty ? member.bounty.toLocaleString() : 0} ฿`);
            console.log(`     Nouveau : Nom="${realUsername}", Prime=${realBounty.toLocaleString()} ฿`);
            hasChanged = true;
            
            newMembersList.push({
              ...member,
              name: realUsername,
              avatar: realAvatar,
              bounty: realBounty
            });
            totalBountySum += realBounty;
          } else {
            newMembersList.push(member);
            totalBountySum += Number(member.bounty || 0);
          }
        } else {
          // Si l'utilisateur n'existe plus dans users, on le garde mais avec sa prime d'origine ou on le retire
          console.log(`  -> Membre [${member.email}] introuvable dans la collection users.`);
          newMembersList.push(member);
          totalBountySum += Number(member.bounty || 0);
        }
      }

      // Vérifier également si le totalBounty stocké est cohérent
      const currentTotalBounty = Number(crewData.totalBounty || 0);
      if (totalBountySum !== currentTotalBounty) {
        console.log(`  -> Différence de prime totale détectée pour "${crewName}" :`);
        console.log(`     Stocké : ${currentTotalBounty.toLocaleString()} ฿`);
        console.log(`     Calculé réel : ${totalBountySum.toLocaleString()} ฿`);
        hasChanged = true;
      }

      if (hasChanged) {
        console.log(`  ⚠️ Enregistrement des corrections pour l'équipage "${crewName}"...`);
        const crewDocRef = doc(db, "crews", crewId);
        await updateDoc(crewDocRef, {
          members: newMembersList,
          totalBounty: totalBountySum
        });
        console.log(`  ✅ Équipage "${crewName}" mis à jour avec succès !`);
      } else {
        console.log(`  ✅ Équipage "${crewName}" est déjà sain et cohérent.`);
      }
    }

    console.log("\n=== RÉPARATION TERMINÉE AVEC SUCCÈS ===");
  } catch (error) {
    console.error("Erreur lors de la réparation de la base de données :", error);
  }
}

repairDatabase();
