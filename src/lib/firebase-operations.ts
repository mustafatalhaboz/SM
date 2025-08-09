import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Project, 
  Task, 
  CreateProjectData, 
  CreateTaskData, 
  UpdateTaskData,
  TaskPriority
} from './types';

// Helper function to convert Firestore document to Project
function docToProject(doc: QueryDocumentSnapshot<DocumentData>): Project {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    createdAt: data.createdAt
  };
}

// Helper function to convert Firestore document to Task
function docToTask(doc: QueryDocumentSnapshot<DocumentData>): Task {
  const data = doc.data();
  return {
    id: doc.id,
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    assignedPerson: data.assignedPerson,
    status: data.status,
    type: data.type,
    priority: data.priority,
    deadline: data.deadline.toDate(),
    createdAt: data.createdAt
  };
}

// PROJECT CRUD OPERATIONS

/**
 * Creates a new project in Firestore
 * @param data Project creation data (name)
 * @returns Promise with the new project's ID
 */
export async function createProject(data: CreateProjectData): Promise<string> {
  try {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      name: data.name,
      createdAt: Timestamp.now()
    });
    console.log('Project created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}

/**
 * Gets all projects from Firestore, ordered by creation date (newest first)
 * @returns Promise with array of projects
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(docToProject(doc));
    });
    
    console.log('Retrieved projects:', projects.length);
    return projects;
  } catch (error) {
    console.error('Error getting projects:', error);
    throw new Error('Failed to get projects');
  }
}

/**
 * Deletes a project and all its associated tasks
 * @param projectId ID of the project to delete
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    // First delete all tasks associated with this project
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(tasksRef, where('projectId', '==', projectId));
    const tasksSnapshot = await getDocs(tasksQuery);
    
    const deletePromises: Promise<void>[] = [];
    tasksSnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    // Wait for all task deletions to complete
    await Promise.all(deletePromises);
    
    // Then delete the project itself
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
    
    console.log('Project and associated tasks deleted:', projectId);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
}

// TASK CRUD OPERATIONS

/**
 * Creates a new task in Firestore
 * @param data Task creation data
 * @returns Promise with the new task's ID
 */
export async function createTask(data: CreateTaskData): Promise<string> {
  try {
    const tasksRef = collection(db, 'tasks');
    const taskData = {
      projectId: data.projectId,
      title: data.title,
      description: data.description || '',
      assignedPerson: data.assignedPerson || '',
      status: data.status || 'Yapılacak',
      type: data.type || 'Operasyon',
      priority: data.priority || 'Orta',
      deadline: data.deadline ? Timestamp.fromDate(data.deadline) : Timestamp.now(),
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(tasksRef, taskData);
    console.log('Task created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
}

/**
 * Updates an existing task in Firestore
 * @param taskId ID of the task to update
 * @param data Partial task data to update
 */
export async function updateTask(taskId: string, data: UpdateTaskData): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const updateData: Partial<DocumentData> = { ...data };
    
    // Convert Date to Timestamp if deadline is provided
    if (data.deadline) {
      updateData.deadline = Timestamp.fromDate(data.deadline);
    }
    
    await updateDoc(taskRef, updateData);
    console.log('Task updated:', taskId);
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
}

/**
 * Deletes a task from Firestore
 * @param taskId ID of the task to delete
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    console.log('Task deleted:', taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
}

/**
 * Gets all tasks for a specific project, ordered by creation date
 * @param projectId ID of the project
 * @returns Promise with array of tasks
 */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef, 
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push(docToTask(doc));
    });
    
    console.log('Retrieved tasks for project:', projectId, tasks.length);
    return tasks;
  } catch (error) {
    console.error('Error getting tasks by project:', error);
    throw new Error('Failed to get tasks');
  }
}

// SPECIALIZED QUERY OPERATIONS

/**
 * Gets high priority tasks across all projects, sorted by priority and deadline
 * @returns Promise with array of high priority tasks
 */
export async function getHighPriorityTasks(): Promise<Task[]> {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('priority', 'in', ['Yüksek', 'Orta']),
      where('status', '!=', 'Yapıldı'),
      orderBy('priority', 'desc'),
      orderBy('deadline', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push(docToTask(doc));
    });
    
    // Custom sorting: Yüksek priority first, then by deadline
    tasks.sort((a, b) => {
      const priorityOrder: Record<TaskPriority, number> = {
        'Yüksek': 3,
        'Orta': 2,
        'Düşük': 1
      };
      
      // First sort by priority (highest first)
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then sort by deadline (earliest first)
      return a.deadline.getTime() - b.deadline.getTime();
    });
    
    console.log('Retrieved high priority tasks:', tasks.length);
    return tasks;
  } catch (error) {
    console.error('Error getting high priority tasks:', error);
    throw new Error('Failed to get high priority tasks');
  }
}