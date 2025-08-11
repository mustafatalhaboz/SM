// Simple migration to add order fields to existing projects
// Run this in browser console on your localhost:3000

async function addOrderFields() {
  const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
  
  // Import your Firebase instance (available globally in browser)
  const db = window.__firebase_db || firebase.firestore();
  
  try {
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    console.log('Found', snapshot.size, 'projects');
    
    const updates = [];
    let order = 0;
    
    snapshot.forEach((document) => {
      const projectRef = doc(db, 'projects', document.id);
      updates.push(updateDoc(projectRef, { order: order++ }));
      console.log(`Adding order ${order-1} to:`, document.data().name);
    });
    
    await Promise.all(updates);
    console.log('✅ All projects updated with order field!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Call the function
addOrderFields();