import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger';

let projectMigrationRunning = false;
let taskMigrationRunning = false;

/**
 * One-time migration to add order field to existing projects
 * Runs automatically when projects are loaded and order fields are missing
 */
export async function migrateProjectOrder(): Promise<void> {
  if (projectMigrationRunning) {
    return;
  }
  
  projectMigrationRunning = true;
  
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
    projectMigrationRunning = false;
  }
}

/**
 * One-time migration to add estimatedDuration field to existing tasks
 * Runs automatically when tasks are loaded and duration fields are missing
 */
export async function migrateTaskDuration(): Promise<void> {
  if (taskMigrationRunning) {
    return;
  }
  
  taskMigrationRunning = true;
  
  try {
    console.log('🔧 Checking for tasks without estimatedDuration field...');
    
    const tasksRef = collection(db, 'tasks');
    const snapshot = await getDocs(tasksRef);
    
    const tasksWithoutDuration: string[] = [];
    
    snapshot.forEach((document) => {
      const data = document.data();
      if (data.estimatedDuration === undefined) {
        tasksWithoutDuration.push(document.id);
      }
    });
    
    if (tasksWithoutDuration.length === 0) {
      console.log('✅ All tasks already have estimatedDuration field');
      return;
    }
    
    console.log(`🔄 Adding estimatedDuration field to ${tasksWithoutDuration.length} tasks...`);
    
    const updatePromises: Promise<void>[] = [];
    
    tasksWithoutDuration.forEach((taskId) => {
      const taskRef = doc(db, 'tasks', taskId);
      updatePromises.push(updateDoc(taskRef, { estimatedDuration: '30dk' }));
      console.log(`📝 Setting estimatedDuration '30dk' for task ${taskId}`);
    });
    
    await Promise.all(updatePromises);
    
    console.log('✅ Task duration migration completed successfully!');
    logger.info('Task duration migration completed', { count: tasksWithoutDuration.length });
    
  } catch (error) {
    console.error('❌ Task duration migration failed:', error);
    logger.error('Task duration migration failed', { error });
  } finally {
    taskMigrationRunning = false;
  }
}