// Migration script to add order field to existing projects
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase config from your project
const firebaseConfig = {
  apiKey: "AIzaSyBEDGkzlA9DlGKrPf-JV8LQIaXq-mZE6hw",
  authDomain: "sm07-1540b.firebaseapp.com", 
  projectId: "sm07-1540b",
  storageBucket: "sm07-1540b.firebasestorage.app",
  messagingSenderId: "469746334671",
  appId: "1:469746334671:web:e5b4d4e7b9d5f4c8d6ac1e"
};

async function migrateProjectOrder() {
  try {
    console.log('🚀 Starting project order migration...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all projects
    const projectsRef = collection(db, 'projects');
    const querySnapshot = await getDocs(projectsRef);
    
    console.log(`📋 Found ${querySnapshot.size} projects to migrate`);
    
    const updatePromises = [];
    let order = 0;
    
    querySnapshot.forEach((document) => {
      const projectRef = doc(db, 'projects', document.id);
      updatePromises.push(updateDoc(projectRef, { order: order++ }));
      console.log(`✅ Adding order ${order - 1} to project: ${document.data().name}`);
    });
    
    await Promise.all(updatePromises);
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateProjectOrder();