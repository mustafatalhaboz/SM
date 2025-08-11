import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger';

let migrationRunning = false;

/**
 * One-time migration to add order field to existing projects
 * Runs automatically when projects are loaded and order fields are missing
 */
export async function migrateProjectOrder(): Promise<void> {
  if (migrationRunning) {
    return;
  }
  
  migrationRunning = true;
  
  try {
    console.log('🔧 Checking for projects without order field...');
    
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    const projectsWithoutOrder: string[] = [];
    const projects: { id: string; createdAt: Timestamp | null }[] = [];
    
    snapshot.forEach((document) => {
      const data = document.data();
      if (data.order === undefined) {
        projectsWithoutOrder.push(document.id);
        projects.push({
          id: document.id,
          createdAt: data.createdAt
        });
      }
    });
    
    if (projectsWithoutOrder.length === 0) {
      console.log('✅ All projects already have order field');
      return;
    }
    
    console.log(`🔄 Adding order field to ${projectsWithoutOrder.length} projects...`);
    
    // Sort projects by creation date (newest first) to maintain current order
    projects.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return 0;
    });
    
    const updatePromises: Promise<void>[] = [];
    
    projects.forEach((project, index) => {
      const projectRef = doc(db, 'projects', project.id);
      updatePromises.push(updateDoc(projectRef, { order: index }));
      console.log(`📝 Setting order ${index} for project ${project.id}`);
    });
    
    await Promise.all(updatePromises);
    
    console.log('✅ Migration completed successfully!');
    logger.info('Project order migration completed', { count: projects.length });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    logger.error('Project order migration failed', { error });
  } finally {
    migrationRunning = false;
  }
}