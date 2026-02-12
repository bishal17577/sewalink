// ========== MIGRATION SCRIPT ==========
// Run this once to convert all USD budgets to NPR
// Save as migrate-currency.js and run with Node.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVYHKeB4TXobILCAygM8JIVisKqUGiJ1s",
  authDomain: "sewalink-ead02.firebaseapp.com",
  projectId: "sewalink-ead02",
  storageBucket: "sewalink-ead02.firebasestorage.app",
  messagingSenderId: "682952754486",
  appId: "1:682952754486:web:c0bba16496d78234aa1f97"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EXCHANGE_RATE = 133.50; // 1 USD = 133.50 NPR

async function migrateCurrency() {
  console.log('🔄 Starting currency migration from USD to NPR...');
  
  // Migrate jobs
  const jobsRef = collection(db, 'jobs');
  const jobsSnapshot = await getDocs(jobsRef);
  
  let jobCount = 0;
  for (const doc of jobsSnapshot.docs) {
    const job = doc.data();
    if (job.budget) {
      const nprBudget = Math.round(job.budget * EXCHANGE_RATE);
      await updateDoc(doc.ref, { 
        budget: nprBudget,
        budgetUSD: job.budget, // Keep original for reference
        currency: 'NPR',
        migratedAt: new Date()
      });
      jobCount++;
      console.log(`✅ Job ${doc.id}: $${job.budget} → रु ${nprBudget}`);
    }
  }
  
  // Migrate user hourly rates
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);
  
  let userCount = 0;
  for (const doc of usersSnapshot.docs) {
    const user = doc.data();
    if (user.hourlyRate) {
      const nprRate = Math.round(user.hourlyRate * EXCHANGE_RATE);
      await updateDoc(doc.ref, { 
        hourlyRate: nprRate,
        hourlyRateUSD: user.hourlyRate,
        currency: 'NPR',
        migratedAt: new Date()
      });
      userCount++;
      console.log(`✅ User ${doc.id}: $${user.hourlyRate}/hr → रु ${nprRate}/hr`);
    }
  }
  
  console.log(`\n🎉 Migration complete!`);
  console.log(`📊 Jobs updated: ${jobCount}`);
  console.log(`👤 Users updated: ${userCount}`);
}

migrateCurrency().catch(console.error);