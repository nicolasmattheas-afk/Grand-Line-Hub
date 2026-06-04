import React, { useState, useEffect } from "react";
import { 
  collection, doc, getDoc, getDocs, updateDoc, setDoc, deleteDoc, 
  arrayUnion, arrayRemove, query, where, limit, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Users, UserPlus, Trash2, Swords, Crown, Trophy, Award, 
  Plus, Compass, Search, LogOut, Check, X, ShieldAlert, 
  Settings, Info, Mail, Star, Anchor, ShieldCheck, Flag
} from "lucide-react";
import { jollyRogersList } from "../data/jollyRogers";
import CrewChat from "./CrewChat";

interface SocialAndCrewProps {
  playerEmail: string | null;
  playerUsername: string;
  playerAvatar: string;
  playerBounty: number;
}

interface FriendProfile {
  email: string;
  username: string;
  avatar: string;
  bounty: number;
  crewName?: string | null;
}

interface CrewMember {
  email: string;
  name: string;
  avatar: string;
  bounty: number;
  role?: string;
}

interface CrewApplication {
  email: string;
  name: string;
  avatar: string;
  bounty: number;
}

interface Crew {
  id: string;
  name: string;
  description: string;
  creatorEmail: string;
  emblem: string;
  accessType: "open" | "invite";
  minBounty: number;
  members: CrewMember[];
  totalBounty: number;
  applications?: CrewApplication[];
}

export const CREW_ROLES = [
  "Capitaine",
  "Second",
  "combattant",
  "cuisinier",
  "navigateur",
  "charpentier",
  "timonier",
  "musicien",
  "sniper",
  "médecin",
  "archéologue",
  "mousse"
];

export default function SocialAndCrew({
  playerEmail,
  playerUsername,
  playerAvatar,
  playerBounty,
}: SocialAndCrewProps) {
  // Navigation interne
  const [subTab, setSubTab] = useState<"friends" | "crews">("friends");

  // State Amis
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendEmailInput, setFriendEmailInput] = useState("");
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendError, setFriendError] = useState<string | null>(null);
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null);

  // State Équipages
  const [allCrews, setAllCrews] = useState<Crew[]>([]);
  const [myCrew, setMyCrew] = useState<Crew | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [crewSearch, setCrewSearch] = useState("");
  const [crewsLoading, setCrewsLoading] = useState(false);

  // Formulaire création d'équipage
  const [crewNameInput, setCrewNameInput] = useState("");
  const [crewDescInput, setCrewDescInput] = useState("");
  const [crewAccessType, setCrewAccessType] = useState<"open" | "invite">("open");
  const [crewMinBounty, setCrewMinBounty] = useState<number>(0);
  const [crewEmblem, setCrewEmblem] = useState("https://static.wikia.nocookie.net/onepiece/images/7/73/Jolly_Roger_Infobox.png");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [crewError, setCrewError] = useState<string | null>(null);
  const [crewSuccess, setCrewSuccess] = useState<string | null>(null);

  // Modal de sélection de Jolly Roger
  const [isEmblemModalOpen, setIsEmblemModalOpen] = useState(false);
  const [emblemSearchQuery, setEmblemSearchQuery] = useState("");
  const [showEmblemNames, setShowEmblemNames] = useState(true);

  // Édition de la description d'équipage
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescInput, setEditDescInput] = useState("");
  const [descSaving, setDescSaving] = useState(false);

  // 1. Écouter le profil utilisateur Firestore de manière réactive
  useEffect(() => {
    if (!playerEmail) {
      setUserProfile(null);
      setFriends([]);
      return;
    }

    const userDocRef = doc(db, "users", playerEmail);
    const unsubscribe = onSnapshot(userDocRef, async (userSnap) => {
      if (userSnap.exists()) {
        const uData = userSnap.data();
        setUserProfile(uData);

        // Fetch les détails de la liste d'amis
        const fEmails: string[] = uData.friends || [];
        if (fEmails.length > 0) {
          const profiles: FriendProfile[] = [];
          for (const email of fEmails) {
            try {
              const snap = await getDoc(doc(db, "users", email));
              if (snap.exists()) {
                const snapData = snap.data();
                profiles.push({
                   email: snap.id,
                   username: snapData.username,
                   avatar: snapData.avatar,
                   bounty: snapData.bounty || 0,
                   crewName: snapData.crewName || null
                });
              }
            } catch (err) {
              console.error(err);
            }
          }
          setFriends(profiles);
        } else {
          setFriends([]);
        }
      } else {
        setUserProfile(null);
        setFriends([]);
      }
    });

    return () => unsubscribe();
  }, [playerEmail]);

  // 2. Écouter mon équipage de manière réactive
  useEffect(() => {
    const crewId = userProfile?.crewId;
    if (!crewId) {
      setMyCrew(null);
      return;
    }

    const crewDocRef = doc(db, "crews", crewId);
    const unsubscribeCrew = onSnapshot(crewDocRef, (snap) => {
      if (snap.exists()) {
        const cData = snap.data();
        setMyCrew({
          id: snap.id,
          name: cData.name,
          description: cData.description,
          creatorEmail: cData.creatorEmail,
          emblem: cData.emblem,
          accessType: cData.accessType,
          minBounty: cData.minBounty || 0,
          members: cData.members || [],
          totalBounty: cData.totalBounty || 0,
          applications: cData.applications || []
        });
      } else {
        setMyCrew(null);
      }
    });

    return () => unsubscribeCrew();
  }, [userProfile?.crewId]);

  // Synchroniser automatiquement l'onglet actif vers "crews" lors de la détection d'un équipage
  useEffect(() => {
    if (myCrew) {
      setSubTab("crews");
    }
  }, [myCrew?.id]);

  // 3. Charger la liste globale des équipages
  const loadAllCrews = async () => {
    setCrewsLoading(true);
    try {
      const q = query(collection(db, "crews"));
      const querySnap = await getDocs(q);
      const list: Crew[] = [];
      querySnap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name,
          description: d.description,
          creatorEmail: d.creatorEmail,
          emblem: d.emblem,
          accessType: d.accessType,
          minBounty: d.minBounty || 0,
          members: d.members || [],
          totalBounty: d.totalBounty || 0,
          applications: d.applications || []
        });
      });
      // Trier par prime totale cumulée décroissante
      list.sort((a, b) => b.totalBounty - a.totalBounty);
      setAllCrews(list);
    } catch (err) {
      console.error(err);
    } finally {
      setCrewsLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === "crews") {
      loadAllCrews();
    }
  }, [subTab]);

  // 4. Ajouter un ami via son email
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFriendError(null);
    setFriendSuccess(null);

    const fEmail = friendEmailInput.trim().toLowerCase();
    if (!fEmail || !playerEmail) return;

    if (fEmail === playerEmail.toLowerCase()) {
      setFriendError("Vous ne pouvez pas vous ajouter vous-même comme pirate allié.");
      return;
    }

    if (friends.some((f) => f.email.toLowerCase() === fEmail)) {
      setFriendError("Ce pirate fait déjà partie de vos amis.");
      return;
    }

    setFriendLoading(true);
    try {
      const friendSnap = await getDoc(doc(db, "users", fEmail));
      if (!friendSnap.exists()) {
        setFriendError("Aucun pirate enregistré avec cet e-mail.");
        return;
      }

      await updateDoc(doc(db, "users", playerEmail), {
        friends: arrayUnion(fEmail)
      });

      setFriendSuccess(`Pirate ajouté : ${friendSnap.data().username} a rejoint vos précieux alliés !`);
      setFriendEmailInput("");
    } catch (err) {
      setFriendError("Une erreur est survenue lors de l'ajout.");
    } finally {
      setFriendLoading(false);
    }
  };

  // 5. Supprimer un ami
  const handleRemoveFriend = async (email: string) => {
    if (!playerEmail) return;
    if (confirm("Voulez-vous retirer ce pirate de vos alliés ?")) {
      try {
        await updateDoc(doc(db, "users", playerEmail), {
          friends: arrayRemove(email)
        });
        setFriendSuccess("Allié retiré de votre liste.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 6. Créer un équipage (max 20 places)
  const handleCreateCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrewError(null);
    setCrewSuccess(null);

    if (!playerEmail) {
      setCrewError("Vous devez être connecté pour créer un équipage !");
      return;
    }

    const name = crewNameInput.trim();
    const desc = crewDescInput.trim();

    if (name.length < 3 || name.length > 25) {
      setCrewError("Le nom de l'équipage doit être compris entre 3 et 25 caractères.");
      return;
    }

    if (userProfile?.crewId) {
      setCrewError("Vous faites déjà partie d'un équipage ! Quittez votre équipage actuel d'abord.");
      return;
    }

    setCrewsLoading(true);
    try {
      // Vérifier l'unicité du nom d'équipage (basique)
      const qExist = query(collection(db, "crews"), where("name", "==", name));
      const existSnap = await getDocs(qExist);
      if (!existSnap.empty) {
        setCrewError("Ce nom d'équipage est déjà pris par un autre capitaine de Grand Line !");
        setCrewsLoading(false);
        return;
      }

      const crewId = "crew_" + Math.random().toString(36).substring(2, 11);

      const newCrewPayload: Crew = {
        id: crewId,
        name,
        description: desc || "Pas de description renseignée.",
        creatorEmail: playerEmail,
        emblem: crewEmblem,
        accessType: crewAccessType,
        minBounty: crewAccessType === "open" ? crewMinBounty : 0,
        members: [{
          email: playerEmail,
          name: playerUsername,
          avatar: playerAvatar,
          bounty: playerBounty,
          role: "Capitaine"
        }],
        totalBounty: playerBounty,
        applications: []
      };

      // Créer document crew
      await setDoc(doc(db, "crews", crewId), newCrewPayload);

      // Associer à l'user profile
      await updateDoc(doc(db, "users", playerEmail), {
        crewId,
        crewName: name
      });

      // Mettre à jour immédiatement l'état local pour un affichage instantané
      setMyCrew(newCrewPayload);
      setUserProfile((prev: any) => ({
        ...prev,
        crewId,
        crewName: name
      }));

      setCrewSuccess(`L'équipage "${name}" a été créé ! Hissez vos couleurs ! 🏴‍☠️`);
      setShowCreateForm(false);
      setSubTab("crews");
      setCrewNameInput("");
      setCrewDescInput("");
      setCrewMinBounty(0);
      loadAllCrews();
    } catch (err) {
      console.error(err);
      setCrewError("Erreur d'écriture dans la base de données.");
    } finally {
      setCrewsLoading(false);
    }
  };

  // 7. Rejoindre directement un équipage Open
  const handleJoinCrewOpen = async (crew: Crew) => {
    if (!playerEmail) return;
    if (userProfile?.crewId) {
      alert("Vous faites déjà partie d'un équipage.");
      return;
    }

    if (crew.members.length >= 20) {
      alert("Cet équipage est complet (limite de 20 membres atteinte) !");
      return;
    }

    if (playerBounty < crew.minBounty) {
      alert(`Votre prime (${playerBounty.toLocaleString()} ฿) est inférieure au minimum requis (${crew.minBounty.toLocaleString()} ฿).`);
      return;
    }

    try {
      const updatedMembers = [...crew.members, {
        email: playerEmail,
        name: playerUsername,
        avatar: playerAvatar,
        bounty: playerBounty,
        role: "mousse"
      }];
      const newTotal = crew.totalBounty + playerBounty;

      await updateDoc(doc(db, "crews", crew.id), {
        members: updatedMembers,
        totalBounty: newTotal
      });

      await updateDoc(doc(db, "users", playerEmail), {
        crewId: crew.id,
        crewName: crew.name
      });

      setUserProfile((prev: any) => ({
        ...prev,
        crewId: crew.id,
        crewName: crew.name
      }));

      alert(`Bienvenue à bord ! Vous avez rejoint l'équipage : ${crew.name} !`);
      loadAllCrews();
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Postuler à un équipage sur invitation (Candidature)
  const handleApplyToCrew = async (crew: Crew) => {
    if (!playerEmail) return;
    if (userProfile?.crewId) {
      alert("Vous êtes déjà membre d'un équipage.");
      return;
    }

    const currentApps = crew.applications || [];
    if (currentApps.some(app => app.email === playerEmail)) {
      alert("Vous avez déjà une demande d'adhésion en attente pour cet équipage.");
      return;
    }

    try {
      await updateDoc(doc(db, "crews", crew.id), {
        applications: arrayUnion({
          email: playerEmail,
          name: playerUsername,
          avatar: playerAvatar,
          bounty: playerBounty
        })
      });
      alert(`Votre candidature a bien été envoyée à l'équipage ${crew.name} ! Un officier va l'analyser.`);
      loadAllCrews();
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Quitter un équipage
  const handleLeaveCrew = async () => {
    if (!playerEmail || !myCrew) return;

    if (myCrew.creatorEmail === playerEmail) {
      alert("En tant que capitaine, vous ne pouvez pas simplement abandonner votre navire ! Dissolvez l'équipage (bouton rouge en bas) ou transférez la couronne.");
      return;
    }

    if (confirm(`Voulez-vous vraiment quitter l'équipage "${myCrew.name}" ?`)) {
      try {
        const updatedMembers = myCrew.members.filter(m => m.email !== playerEmail);
        const newTotal = myCrew.totalBounty - playerBounty;

        await updateDoc(doc(db, "crews", myCrew.id), {
          members: updatedMembers,
          totalBounty: newTotal
        });

        await updateDoc(doc(db, "users", playerEmail), {
          crewId: null,
          crewName: null
        });

        alert("Vous avez quitté votre ancien équipage.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 10. Capitaine ou Second : Accepter un postulant
  const handleAcceptApplicant = async (applicant: CrewApplication) => {
    if (!myCrew || !playerEmail) return;

    // Déterminer le rôle
    const me = myCrew.members.find(m => m.email === playerEmail);
    const myRole = me?.role || (myCrew.creatorEmail === playerEmail ? "Capitaine" : "mousse");

    if (myRole !== "Capitaine" && myRole !== "Second") {
      alert("Seuls le Capitaine et les Seconds peuvent valider les candidatures !");
      return;
    }

    if (myCrew.members.length >= 20) {
      alert("Cet équipage est déjà au maximum de sa capacité (20 membres) !");
      return;
    }

    try {
      const updatedMembers = [...myCrew.members, {
        email: applicant.email,
        name: applicant.name,
        avatar: applicant.avatar,
        bounty: applicant.bounty,
        role: "mousse"
      }];
      const updatedApps = (myCrew.applications || []).filter(a => a.email !== applicant.email);
      const newTotal = myCrew.totalBounty + applicant.bounty;

      // Mettre à jour crews
      await updateDoc(doc(db, "crews", myCrew.id), {
        members: updatedMembers,
        applications: updatedApps,
        totalBounty: newTotal
      });

      // Mettre à jour applicant profile
      await updateDoc(doc(db, "users", applicant.email), {
        crewId: myCrew.id,
        crewName: myCrew.name
      });

      alert(`Bienvenue accordé ! ${applicant.name} fait maintenant officiellement partie de vos Nakamas !`);
    } catch (err) {
      console.error(err);
    }
  };

  // 11. Capitaine ou Second : Décliner un postulant
  const handleRejectApplicant = async (applicant: CrewApplication) => {
    if (!myCrew || !playerEmail) return;

    // Déterminer le rôle
    const me = myCrew.members.find(m => m.email === playerEmail);
    const myRole = me?.role || (myCrew.creatorEmail === playerEmail ? "Capitaine" : "mousse");

    if (myRole !== "Capitaine" && myRole !== "Second") {
      alert("Seuls le Capitaine et les Seconds peuvent rejeter les candidatures !");
      return;
    }

    try {
      const updatedApps = (myCrew.applications || []).filter(a => a.email !== applicant.email);
      await updateDoc(doc(db, "crews", myCrew.id), {
        applications: updatedApps
      });
      alert(`Candidature de ${applicant.name} déclinée.`);
    } catch (err) {
      console.error(err);
    }
  };

  // 12. Capitaine/Second : Expulser un membre (Kick)
  const handleKickMember = async (memberEmail: string, memberBounty: number) => {
    if (!myCrew || !playerEmail) return;
    if (memberEmail === playerEmail) return;

    // Déterminer le rôle
    const me = myCrew.members.find(m => m.email === playerEmail);
    const myRole = me?.role || (myCrew.creatorEmail === playerEmail ? "Capitaine" : "mousse");
    const myRoleLower = myRole.toLowerCase();

    if (myRoleLower !== "capitaine" && myRoleLower !== "second") {
      alert("Seuls le Capitaine et les Seconds peuvent expulser des membres !");
      return;
    }

    const targetMember = myCrew.members.find(m => m.email === memberEmail);
    if (!targetMember) return;
    const targetRole = targetMember.role || (myCrew.creatorEmail === memberEmail ? "Capitaine" : "mousse");
    const targetRoleLower = targetRole.toLowerCase();

    const isTargetCapitaine = targetRoleLower === "capitaine" || memberEmail === myCrew.creatorEmail;
    const isTargetSecond = targetRoleLower === "second";

    if (isTargetCapitaine) {
      alert("Impossible d'expulser le Capitaine de l'équipage !");
      return;
    }

    if (myRoleLower === "second" && (isTargetSecond || isTargetCapitaine)) {
      alert("En tant que Second, vous ne pouvez pas expulser un autre Second ni le Capitaine !");
      return;
    }

    if (confirm(`Voulez-vous vraiment expulser ${targetMember.name} de votre équipage ?`)) {
      try {
        const updatedMembers = myCrew.members.filter(m => m.email !== memberEmail);
        const newTotal = myCrew.totalBounty - memberBounty;

        await updateDoc(doc(db, "crews", myCrew.id), {
          members: updatedMembers,
          totalBounty: newTotal
        });

        await updateDoc(doc(db, "users", memberEmail), {
          crewId: null,
          crewName: null
        });

        alert("Membre banni de l'équipage.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 12b. Capitaine/Second : Promouvoir ou modifier le rôle d'un membre
  const handlePromoteMember = async (memberEmail: string, newRole: string) => {
    if (!myCrew || !playerEmail) return;

    // Déterminer le rôle
    const me = myCrew.members.find(m => m.email === playerEmail);
    const myRole = me?.role || (myCrew.creatorEmail === playerEmail ? "Capitaine" : "mousse");
    const myRoleLower = myRole.toLowerCase();

    if (myRoleLower !== "capitaine" && myRoleLower !== "second") {
      alert("Seuls le Capitaine et les Seconds de l'équipage peuvent attribuer des rôles !");
      return;
    }

    // Le Second ne peut pas promouvoir au rang de Second
    if (myRoleLower === "second" && newRole.toLowerCase() === "second") {
      alert("Seul le Capitaine de l'équipage peut nommer un Second !");
      return;
    }

    // De même, le Second ne peut pas modifier un autre Second ou le Capitaine
    const targetMember = myCrew.members.find(m => m.email === memberEmail);
    if (!targetMember) return;
    const targetCurrentRole = targetMember.role || (myCrew.creatorEmail === memberEmail ? "Capitaine" : "mousse");
    const targetCurrentRoleLower = targetCurrentRole.toLowerCase();

    const isTargetCapitaine = targetCurrentRoleLower === "capitaine" || memberEmail === myCrew.creatorEmail;
    const isTargetSecond = targetCurrentRoleLower === "second";

    if (isTargetCapitaine) {
      alert("Impossible de modifier le rôle du Capitaine de l'équipage !");
      return;
    }

    if (myRoleLower === "second" && (isTargetSecond || isTargetCapitaine)) {
      alert("En tant que Second, vous ne pouvez pas modifier un autre Second ni le Capitaine !");
      return;
    }

    try {
      const updatedMembers = myCrew.members.map(m => {
        if (m.email === memberEmail) {
          return { ...m, role: newRole };
        }
        return m;
      });

      await updateDoc(doc(db, "crews", myCrew.id), {
        members: updatedMembers
      });

      alert(`Le rôle de ${targetMember.name} a été changé en "${newRole}".`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification du rôle.");
    }
  };

  // 13. Capitaine : Dissoudre l'équipage
  const handleDisbandCrew = async () => {
    if (!myCrew || !playerEmail) return;

    if (confirm(`⚠️ ATTENTION CAPITAINE ! Voulez-vous vraiment DISSOUDRE l'équipage "${myCrew.name}" ? Tous les membres redeviennent des pirates sans attache et l'historique sera supprimé à jamais.`)) {
      try {
        // Enlever les liaisons
        for (const m of myCrew.members) {
          try {
            await updateDoc(doc(db, "users", m.email), {
              crewId: null,
              crewName: null
            });
          } catch (e) {
            console.error(e);
          }
        }

        // Supprimer crews doc
        await deleteDoc(doc(db, "crews", myCrew.id));
        alert("Votre équipage a sombré dans les profondeurs de l'océan. Vous revoilà pirate solitaire.");
        setMyCrew(null);
        loadAllCrews();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 14. Modifier la description de l'équipage
  const handleSaveDescription = async () => {
    if (!myCrew || !playerEmail) return;
    const descText = editDescInput.trim();
    if (descText.length < 3) {
      alert("La description est un peu courte ! Écrivez au moins 3 caractères.");
      return;
    }
    if (descText.length > 200) {
      alert("La description doit faire moins de 200 caractères.");
      return;
    }
    setDescSaving(true);
    try {
      await updateDoc(doc(db, "crews", myCrew.id), {
        description: descText
      });
      setIsEditingDesc(false);
    } catch (err) {
      console.error(err);
      alert("Une erreur s'est produite lors de la mise à jour de la description.");
    } finally {
      setDescSaving(false);
    }
  };

  const handleAdminCleanupCrews = async () => {
    if (!confirm("⚠️ DANGER : Voulez-vous vraiment SUPPRIMER TOUS les équipages du système et délier tous les utilisateurs ? Cette action est irréversible !")) return;
    
    setCrewsLoading(true);
    try {
      // 1. Charger tous les équipages & supprimer
      const crewsSnap = await getDocs(collection(db, "crews"));
      for (const cDoc of crewsSnap.docs) {
        await deleteDoc(doc(db, "crews", cDoc.id));
      }

      // 2. Charger tous les users & nettoyer
      const usersSnap = await getDocs(collection(db, "users"));
      for (const uDoc of usersSnap.docs) {
        const uData = uDoc.data();
        if (uData.crewId || uData.crewName) {
          await updateDoc(doc(db, "users", uDoc.id), {
            crewId: null,
            crewName: null
          });
        }
      }

      alert("Tous les équipages actuels ont été anéantis ! Tous les flibustiers sont à nouveau de libres pirates.");
      setMyCrew(null);
      setUserProfile((prev: any) => prev ? { ...prev, crewId: null, crewName: null } : null);
      loadAllCrews();
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors du nettoyage par l'administrateur.");
    } finally {
      setCrewsLoading(false);
    }
  };

  // Filtrer les équipages par barre de recherche
  const filteredCrews = allCrews.filter((c) => 
    c.name.toLowerCase().includes(crewSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(crewSearch.toLowerCase())
  );

  const meInCrew = myCrew?.members?.find(m => m.email === playerEmail);
  const myCrewRole = meInCrew?.role || (myCrew?.creatorEmail === playerEmail ? "Capitaine" : "mousse");
  const isHabilitatedToEdit = myCrew ? (myCrew.creatorEmail === playerEmail || myCrewRole === "Capitaine" || myCrewRole === "Second" || myCrewRole === "second") : false;

  if (!playerEmail) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-white max-w-xl mx-auto shadow-2xl text-center font-sans space-y-4">
        <Users className="w-12 h-12 mx-auto mb-2 text-violet-400 animate-pulse" />
        <h4 className="font-heading font-black text-sm uppercase tracking-wider text-slate-100">BATAILLE DES ÉQUIPAGES EN LIGNE</h4>
        <div className="p-5 rounded-2xl bg-white border border-gray-150 text-slate-900 text-xs leading-relaxed font-sans text-left space-y-3 shadow-xs">
          <p className="font-bold text-red-650 flex items-center gap-1.5 font-heading text-sm">⚠️ CONNEXION EN LIGNE REQUISE</p>
          <p>
            Comme la création d'un équipage, le chat écrit en ligne en temps réel et le classement collectif de la piraterie sont des fonctionnalités multijoueurs, 
            <strong> seuls les pirates ayant créé et connecté un compte pirate peuvent y accéder.</strong>
          </p>
          <p className="text-slate-500 text-[10px] uppercase font-mono mt-2 pt-2 border-t border-gray-100">
            Pour fonder votre équipage et recruter des Nakamas, connectez-vous ou enregistrez-vous dans l'encadré <strong className="text-violet-700">"CONNECTER UN COMPTE EN LIGNE"</strong> du <strong className="text-violet-700">Tableau de Bord</strong> !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800/80 p-6 shadow-xs max-w-5xl mx-auto font-sans text-left">
      
      {/* Onglets */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 mb-6 gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => setSubTab("friends")}
            className={`pb-3 px-4 text-xs font-heading font-black uppercase tracking-wider relative transition-colors cursor-pointer ${
              subTab === "friends" ? "text-violet-400 border-b-2 border-violet-500 font-extrabold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🤝 Nakamas ({friends.length})
          </button>
          <button
            onClick={() => setSubTab("crews")}
            className={`pb-3 px-4 text-xs font-heading font-black uppercase tracking-wider relative transition-colors cursor-pointer ${
              subTab === "crews" ? "text-violet-400 border-b-2 border-violet-500 font-extrabold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🏴‍☠️ Équipage {myCrew ? `(${myCrew.name})` : ""}
          </button>
        </div>
        
        {playerEmail === "nicolasmattheas@gmail.com" && (
          <button
            onClick={handleAdminCleanupCrews}
            className="mb-3 px-3.5 py-1.5 bg-red-650/40 hover:bg-red-650 text-red-200 hover:text-white border border-red-800/60 hover:border-red-600 rounded-xl text-[10px] font-heading font-black tracking-wider uppercase transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            🚨 NETTOYER TOUS LES ÉQUIPAGES
          </button>
        )}
      </div>

      {/* SECTION AMIS */}
      {subTab === "friends" && (
        <div className="space-y-6">
          <div className="border border-gray-150 bg-white rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-slate-900">
            <div className="text-left">
              <h5 className="font-heading font-black text-gray-950 text-sm uppercase">Recruter un Pirate Allié</h5>
              <p className="text-xs text-gray-500 mt-1">Saisissez l'e-mail de votre compagnon pour l'ajouter à vos alliés de combat.</p>
            </div>
            
            <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0 max-w-sm">
              <input
                type="email"
                placeholder="Ex : compagnon@onepiece.com"
                value={friendEmailInput}
                onChange={(e) => setFriendEmailInput(e.target.value)}
                className="flex-1 bg-white p-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 w-full"
              />
              <button
                type="submit"
                disabled={friendLoading}
                className="px-4 py-3 bg-violet-600 text-white font-heading font-black text-xs uppercase rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
              >
                {friendLoading ? "..." : <UserPlus className="w-4 h-4" />}
                RECRUTER
              </button>
            </form>
          </div>

          {friendError && (
            <p className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 p-2.5 rounded-lg">{friendError}</p>
          )}

          {friendSuccess && (
            <p className="text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">{friendSuccess}</p>
          )}

          {/* Liste des amis */}
          <div>
            <h5 className="font-heading font-black text-slate-200 text-xs uppercase tracking-wider mb-3">VOS NAKAMAS ACTUELS</h5>
            
            {friends.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold">Aucun pirate allié recensé dans votre carnet de voyage.</p>
                <p className="text-[10px] text-gray-400 mt-1">Ajoutez un ami ci-dessus pour lancer des combats ou suivre vos réputations !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend.email} className="p-4 rounded-2xl border border-gray-150 flex items-center justify-between bg-white hover:bg-slate-50 transition-all shadow-2xs group">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={friend.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(friend.username)}`} 
                        alt="Avatar"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-100 border border-[#F1F5F9]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight flex items-center gap-1">
                          {friend.username}
                          {friend.crewName && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-50 border border-violet-100/50 text-violet-600 font-extrabold tracking-tight uppercase">
                              {friend.crewName}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] font-mono font-bold text-amber-600 mt-1">฿ {friend.bounty.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRemoveFriend(friend.email)}
                        className="p-2 border border-gray-150 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Retirer des alliés"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION ÉQUIPAGES / GUILDES */}
      {subTab === "crews" && (
        <div className="space-y-6">
          
          {/* SI JE SUIS DEJA MEMBRE D'UN ÉQUIPAGE */}
          {myCrew ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Infos Équipage */}
              <div className="lg:col-span-1 p-5 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/40 via-white to-white space-y-5 shadow-2xs">
                <div className="text-center space-y-2 relative">
                  <div className="flex justify-center select-none text-5xl">
                    {myCrew.emblem && myCrew.emblem.startsWith("http") ? (
                      <img 
                        src={myCrew.emblem} 
                        alt="Emblème d'Équipage" 
                        className="w-20 h-20 object-contain rounded-2xl bg-white p-1.5 border border-slate-200/50 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{myCrew.emblem || "🏴‍☠️"}</span>
                    )}
                  </div>
                  <h4 className="font-heading font-black text-xl text-gray-900 tracking-tight uppercase leading-none">{myCrew.name}</h4>
                  
                  {myCrew.creatorEmail === playerEmail ? (
                    <span className="inline-block text-[9px] font-mono bg-amber-500 text-black border border-amber-600 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                      👑 CAPITAINE
                    </span>
                  ) : (
                    <span className="inline-block text-[9px] font-mono bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">
                      🏴‍☠️ MON RECRUTEMENT
                    </span>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="border-t border-[#F1F5F9] pt-4 space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-violet-600">Modifier la Devise</span>
                    <textarea
                      value={editDescInput}
                      onChange={(e) => setEditDescInput(e.target.value)}
                      disabled={descSaving}
                      rows={3}
                      className="w-full text-xs p-2.5 border border-violet-100 rounded-xl focus:ring-1 focus:ring-violet-500 bg-white"
                      placeholder="Nouvelle devise de l'équipage..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingDesc(false)}
                        disabled={descSaving}
                        className="px-2.5 py-1 text-[10px] bg-gray-100 hover:bg-gray-250 text-gray-600 font-bold rounded-lg uppercase cursor-pointer transition"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveDescription}
                        disabled={descSaving}
                        className="px-2.5 py-1 text-[10px] bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg uppercase cursor-pointer transition flex items-center gap-1 font-heading"
                      >
                        {descSaving ? "Sauvegarde..." : "Enregistrer 💾"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-[#F1F5F9] pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-violet-600">Devise de l'Équipage</span>
                      {isHabilitatedToEdit && (
                        <button
                          onClick={() => {
                            setEditDescInput(myCrew.description || "");
                            setIsEditingDesc(true);
                          }}
                          className="text-[10px] text-violet-600 hover:text-violet-700 font-bold underline cursor-pointer transition flex items-center gap-0.5"
                        >
                          Modifier 📝
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">"{myCrew.description}"</p>
                  </div>
                )}

                <div className="border-t border-[#F1F5F9] pt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-mono text-gray-400 block font-bold uppercase">Membres</span>
                    <span className="text-sm font-heading font-black text-gray-800">{myCrew.members.length} / 20</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-mono text-gray-400 block font-bold uppercase">Condition</span>
                    <span className="text-xs font-bold text-violet-600 block truncate">
                      {myCrew.accessType === "open" 
                        ? (myCrew.minBounty > 0 ? `฿ ${myCrew.minBounty.toLocaleString()}` : "Ouvert")
                        : "Sur Invitation"
                      }
                    </span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="font-mono font-bold text-amber-900 uppercase tracking-tight">Prime Cumulative</span>
                  </div>
                  <span className="font-mono font-black text-gray-800 tracking-tight">฿ {myCrew.totalBounty.toLocaleString()}</span>
                </div>

                {myCrew.creatorEmail === playerEmail ? (
                  <button
                    onClick={handleDisbandCrew}
                    className="w-full py-2.5 bg-red-600 text-white font-heading font-bold text-xs uppercase rounded-xl hover:bg-red-700 cursor-pointer tracking-wide flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    💥 DISSOUDRE L'ÉQUIPAGE
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveCrew}
                    className="w-full py-2.5 bg-gray-900 text-white font-heading font-bold text-xs uppercase rounded-xl hover:bg-red-600 cursor-pointer tracking-wide flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <LogOut className="w-4 h-4" />
                    QUITTER L'ÉQUIPAGE
                  </button>
                )}
              </div>

              {/* Liste des Membres & Candidatures */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Section Membres */}
                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-2xs">
                  <h5 className="font-heading font-black text-gray-900 text-xs uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>MEMBRES DE L'EQUIPAGE ({myCrew.members.length})</span>
                    <span className="font-mono opacity-50 text-[10px]">Limite : 20 Nakamas</span>
                  </h5>

                  <div className="flex flex-col gap-3">
                    {myCrew.members.map((member, idx) => {
                      const isCreator = member.email === myCrew.creatorEmail;
                      const memberRole = member.role || (isCreator ? "Capitaine" : "mousse");

                      // Déterminer les rôles et permissions
                      const me = myCrew.members.find(m => m.email === playerEmail);
                      const myRole = me?.role || (myCrew.creatorEmail === playerEmail ? "Capitaine" : "mousse");

                      const myRoleLower = myRole.toLowerCase();
                      const memberRoleLower = memberRole.toLowerCase();
                      const targetIsCreatorOrCapitaine = isCreator || memberRoleLower === "capitaine" || member.email === myCrew.creatorEmail;
                      const targetIsSecond = memberRoleLower === "second";

                      // Qui peut promouvoir : Capitaine ou Second (ne peut pas promouvoir si cible est capitaine, ou si second, cible est aussi second/capitaine)
                      const canPromoteThisMember = (myRoleLower === "capitaine" && member.email !== playerEmail) ||
                                                    (myRoleLower === "second" && !targetIsCreatorOrCapitaine && !targetIsSecond && member.email !== playerEmail);

                      // Qui peut kick : Capitaine ou Second (ne peut pas kick si cible est capitaine, ou si second, cible est aussi second/capitaine)
                      const canKickThisMember = (myRoleLower === "capitaine" && member.email !== playerEmail) ||
                                                 (myRoleLower === "second" && !targetIsCreatorOrCapitaine && !targetIsSecond && member.email !== playerEmail);

                      // Choix de style selon le rôle
                      let roleBadgeClass = "bg-slate-200 text-slate-700 border-slate-350";
                      if (memberRole === "Capitaine") {
                        roleBadgeClass = "bg-amber-500/10 border border-amber-500/20 text-amber-700 font-extrabold";
                      } else if (memberRole === "Second") {
                        roleBadgeClass = "bg-violet-600 text-white font-extrabold";
                      } else if (memberRole !== "mousse") {
                        roleBadgeClass = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-bold";
                      }

                      return (
                        <div key={idx} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={member.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(member.name)}`} 
                              alt="Avatar"
                              className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate uppercase flex items-center gap-1.5">
                                {member.name}
                                {isCreator && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                              </p>
                              <p className="text-[10px] font-mono text-amber-600">฿ {member.bounty.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${roleBadgeClass}`}>
                              {memberRole}
                            </span>

                            {/* Menu de Promotion */}
                            {canPromoteThisMember && (
                              <select
                                value={memberRole}
                                onChange={(e) => handlePromoteMember(member.email, e.target.value)}
                                className="bg-white border border-gray-250 text-[10px] font-bold text-gray-800 rounded px-1.5 py-1 focus:outline-none focus:border-violet-500 cursor-pointer"
                              >
                                {CREW_ROLES.map((r) => {
                                  // Un second ne peut pas promouvoir au rang de Second
                                  if (myRole === "Second" && r === "Second") return null;
                                  // Personne ne peut rétrograder ou promouvoir au rang de Capitaine
                                  if (r === "Capitaine") return null;
                                  return (
                                    <option key={r} value={r}>
                                      Rôle : {r}
                                    </option>
                                  );
                                })}
                              </select>
                            )}

                            {/* Option bannir */}
                            {canKickThisMember && (
                              <button
                                onClick={() => handleKickMember(member.email, member.bounty)}
                                className="px-2 py-1 text-[10px] font-bold text-red-650 hover:bg-red-50 hover:text-red-700 rounded transition-colors uppercase border border-red-200/50 cursor-pointer"
                              >
                                Expulser
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section Candidatures (Uniquement pour le Capitaine ou Second) */}
                {(() => {
                  const me = myCrew.members.find(m => m.email === playerEmail);
                  const myRole = me?.role || (myCrew.creatorEmail === playerEmail ? "Capitaine" : "mousse");
                  const canManageApps = myRole === "Capitaine" || myRole === "Second";

                  if (!canManageApps) return null;

                  return (
                    <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-2xs">
                      <h5 className="font-heading font-black text-amber-900 text-xs uppercase tracking-wider mb-4 border-b border-amber-100/60 pb-2 flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-amber-600" />
                        DEMANDES D'ADHÉSION ({ (myCrew.applications || []).length })
                      </h5>

                      {(myCrew.applications || []).length === 0 ? (
                        <p className="text-center py-6 text-xs text-gray-400 font-mono">Aucun pirate en attente d'approbation sur le pont.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {myCrew.applications?.map((applicant, idx) => (
                            <div key={idx} className="p-3 bg-amber-500/5 border border-amber-100 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3 min-w-0">
                                <img 
                                  src={applicant.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(applicant.name)}`} 
                                  alt="Avatar"
                                  className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate uppercase">{applicant.name}</p>
                                  <p className="text-[10px] font-mono text-amber-600">฿ {applicant.bounty.toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAcceptApplicant(applicant)}
                                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase text-center cursor-pointer hover:bg-emerald-700 transition"
                                >
                                  Accepter
                                </button>
                                <button
                                  onClick={() => handleRejectApplicant(applicant)}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-[10px] font-black uppercase text-center cursor-pointer hover:bg-gray-300 transition"
                                >
                                  Refuser
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Chat dynamique écrit en ligne de l'équipage */}
                {myCrew && playerEmail && (
                  <CrewChat 
                    crewId={myCrew.id} 
                    playerEmail={playerEmail} 
                    playerUsername={playerUsername} 
                    playerAvatar={playerAvatar} 
                  />
                )}

              </div>

            </div>
          ) : (
            
            // SI JE N'AI PAS ENCORE D'ÉQUIPAGE
            <div className="space-y-6">

              {crewError && (
                <p className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 p-2.5 rounded-lg">{crewError}</p>
              )}
              {crewSuccess && (
                <p className="text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">{crewSuccess}</p>
              )}

              {/* Titre & Call-to-actions de départ */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-4">
                <div>
                  <h4 className="font-heading font-black text-white text-lg uppercase tracking-tight">Recrutez ou rejoignez un équipage !</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Associez vos forces avec vos Nakamas de combat ou fondez votre dynastie de flibustiers.</p>
                </div>

                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2.5 bg-violet-600 text-white font-heading font-black text-xs uppercase rounded-xl hover:bg-violet-700 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Créer son équipage
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 font-heading font-black text-xs uppercase rounded-xl hover:bg-gray-300 cursor-pointer transition-colors"
                  >
                    Fermer la création
                  </button>
                )}
              </div>

              {/* Formulaire de création */}
              {showCreateForm && (
                <form onSubmit={handleCreateCrew} className="bg-slate-50 border border-violet-100 rounded-2xl p-6 space-y-4">
                  <h5 className="font-heading font-black text-sm text-gray-950 uppercase">Formulaire de fondation d'Équipage</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-extrabold text-[#1A1A1A] block">Nom unique de l'Équipage</label>
                      <input
                        type="text"
                        placeholder="Ex : Équipage du Chapeau de paille"
                        value={crewNameInput}
                        onChange={(e) => setCrewNameInput(e.target.value)}
                        className="w-full bg-white p-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1A1A1A] placeholder-gray-400"
                        maxLength={25}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-extrabold text-[#1A1A1A] block">Drapeau d'Équipage (Emblème)</label>
                      <div className="flex gap-3 items-center">
                        <button
                          type="button"
                          onClick={() => setIsEmblemModalOpen(true)}
                          className="p-1 bg-white border border-gray-250 rounded-xl w-14 h-14 flex items-center justify-center select-none hover:border-violet-500 focus:outline-none transition group text-3xl shrink-0 cursor-pointer"
                        >
                          {crewEmblem && crewEmblem.startsWith("http") ? (
                            <img
                              src={crewEmblem}
                              alt="Choix du drapeau"
                              className="w-12 h-12 object-contain rounded-lg group-hover:scale-105 transition"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span>{crewEmblem}</span>
                          )}
                        </button>
                        <div>
                          <button
                            type="button"
                            onClick={() => setIsEmblemModalOpen(true)}
                            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-heading font-black uppercase text-center cursor-pointer transition shadow-3xs flex items-center gap-2"
                          >
                            <Flag className="w-3.5 h-3.5" /> Choisir le drapeau
                          </button>
                          <span className="text-[9px] uppercase font-mono text-slate-500 block mt-1">Jolly Rogers originaux d'One Piece</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-extrabold text-[#1A1A1A] block">Devise / Description</label>
                    <textarea
                      placeholder="Indiquez vos objectifs ou vos règles..."
                      value={crewDescInput}
                      onChange={(e) => setCrewDescInput(e.target.value)}
                      className="w-full bg-white p-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1A1A1A] placeholder-gray-400"
                      rows={2}
                      maxLength={100}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-extrabold text-[#1A1A1A] block">Mode de Recrutement</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCrewAccessType("open")}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition ${
                            crewAccessType === "open" ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-slate-100"
                          }`}
                        >
                          Ouvert à tous (Open)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCrewAccessType("invite")}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition ${
                            crewAccessType === "invite" ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-slate-100"
                          }`}
                        >
                          Candidature direct (Invite)
                        </button>
                      </div>
                    </div>

                    {crewAccessType === "open" && (
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono font-extrabold text-[#1A1A1A] block">Prime minimum requise</label>
                        <input
                          type="number"
                          placeholder="Ex: 50000000"
                          value={crewMinBounty === 0 ? "" : crewMinBounty}
                          onChange={(e) => setCrewMinBounty(Number(e.target.value))}
                          className="w-full bg-white p-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1A1A1A] placeholder-gray-400"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 text-right">
                    <button
                      type="submit"
                      disabled={crewsLoading}
                      className="px-5 py-3 bg-white hover:bg-gray-100 border border-gray-300 text-black font-heading font-black text-xs uppercase rounded-xl cursor-pointer shadow-sm transition duration-150"
                    >
                      ⚓ créer mon équipage
                    </button>
                  </div>
                </form>
              )}

              {/* Recherche d'Équipage existant & Classement */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white p-3 border border-gray-150 rounded-2xl">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Saisissez un nom d'équipage pirate ou une devise..."
                    value={crewSearch}
                    onChange={(e) => setCrewSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs text-gray-800 placeholder-slate-400"
                  />
                  <button 
                    onClick={loadAllCrews}
                    className="p-1.5 px-3 bg-black hover:bg-slate-900 border border-slate-850 text-white rounded text-[9px] font-mono uppercase font-black cursor-pointer tracking-wider shrink-0 duration-150"
                  >
                    Actualiser 🔄
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
                  <div className="p-4 bg-slate-50 border-b border-gray-150">
                    <h5 className="font-heading font-black text-gray-950 text-xs uppercase tracking-wider">RECHERCHER ET REJOINDRE DES ÉQUIPAGES</h5>
                  </div>

                  {filteredCrews.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 font-mono text-xs">
                      <Compass className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      YOHOHOHO ! Aucun équipage trouvé selon vos critères.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-150">
                      {filteredCrews.map((crew) => {
                        return (
                          <div key={crew.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-all flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {crew.emblem && crew.emblem.startsWith("http") ? (
                                <img 
                                  src={crew.emblem} 
                                  alt="Emblème d'Équipage" 
                                  className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-gray-150 p-1 select-none shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-3xl select-none shrink-0">{crew.emblem || "🏴‍☠️"}</span>
                              )}
                              <div className="min-w-0">
                                <h6 className="font-heading font-black text-gray-900 text-xs uppercase tracking-tight truncate flex items-center gap-2">
                                  {crew.name}
                                  <span className="font-mono text-[9px] opacity-40 lowercase">({crew.members.length}/20)</span>
                                </h6>
                                <p className="text-[10px] text-gray-500 italic truncate max-w-sm">"{crew.description}"</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <span className="block text-[9px] uppercase font-mono font-bold text-gray-400">PRIME GLOBALE</span>
                                <span className="font-mono font-black text-xs text-amber-600 block">฿ {crew.totalBounty.toLocaleString()}</span>
                              </div>

                              <div className="shrink-0">
                                {crew.accessType === "open" ? (
                                  <button
                                    onClick={() => handleJoinCrewOpen(crew)}
                                    className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-750 text-white rounded-xl text-[10px] font-heading font-black uppercase text-center cursor-pointer transition shadow-3xs"
                                  >
                                    Rejoindre
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApplyToCrew(crew)}
                                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-heading font-black uppercase text-center cursor-pointer transition shadow-3xs"
                                  >
                                    Postuler
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Modal / Fenêtre flottante de choix de drapeau */}
      {isEmblemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-150 transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h4 className="font-heading font-black text-gray-900 text-sm uppercase tracking-wide leading-none flex items-center gap-2">
                  🏴‍☠️ Armurerie des Jolly Rogers Légendaires
                </h4>
                <p className="text-[10px] text-gray-500 font-sans mt-1">Hissez le pavillon de votre équipage dans le classement officiel</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEmblemModalOpen(false);
                  setEmblemSearchQuery("");
                }}
                className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barre de Recherche et Options */}
            <div className="p-4 bg-slate-50/50 border-b border-gray-150 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={emblemSearchQuery}
                  onChange={(e) => setEmblemSearchQuery(e.target.value)}
                  className="w-full bg-white pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Bouton Toggle pour voir/cacher le nom du drapeau */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] uppercase font-mono font-extrabold text-[#747474]">Affichage :</span>
                <button
                  type="button"
                  onClick={() => setShowEmblemNames(!showEmblemNames)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-black uppercase tracking-wider border select-none transition cursor-pointer ${
                    showEmblemNames 
                      ? "bg-violet-50 border-violet-200 text-violet-600" 
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {showEmblemNames ? "Nom visible 👁️" : "Nom masqué 🙈"}
                </button>
              </div>
            </div>

            {/* Grille des drapeaux */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {jollyRogersList
                  .filter((jr) =>
                    jr.name.toLowerCase().includes(emblemSearchQuery.toLowerCase())
                  )
                  .map((jr) => {
                    const isSelected = crewEmblem === jr.image;
                    return (
                      <button
                        key={jr.name}
                        type="button"
                        onClick={() => {
                          setCrewEmblem(jr.image);
                          setIsEmblemModalOpen(false);
                          setEmblemSearchQuery("");
                        }}
                        className={`group p-3 rounded-2xl border text-center transition flex flex-col items-center gap-2.5 cursor-pointer hover:bg-slate-50 hover:scale-102 focus:outline-none active:scale-98 relative ${
                          isSelected
                            ? "border-violet-600 bg-violet-50/50 shadow-xs"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 bg-violet-650 text-white rounded-full p-0.5 shadow-xs z-10">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 rounded-xl bg-slate-950/5 border border-gray-150/40 group-hover:bg-slate-950/10 transition">
                          <img
                            src={jr.image}
                            alt={jr.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:scale-110 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        {/* Afficher ou non le nom du drapeau */}
                        {showEmblemNames && (
                          <span className="text-[10px] font-mono leading-tight font-bold text-gray-800 line-clamp-2 max-w-[130px] select-none uppercase tracking-tight">
                            {jr.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>

              {jollyRogersList.filter((jr) =>
                jr.name.toLowerCase().includes(emblemSearchQuery.toLowerCase())
              ).length === 0 && (
                <div className="py-12 text-center text-gray-400 font-mono text-xs">
                  Aucun drapeau correspondant à "{emblemSearchQuery}".
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-150 text-right">
              <button
                type="button"
                onClick={() => {
                  setIsEmblemModalOpen(false);
                  setEmblemSearchQuery("");
                }}
                className="px-4 py-2 bg-gray-250 text-gray-700 font-heading font-black text-xs uppercase rounded-xl hover:bg-gray-300 cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
