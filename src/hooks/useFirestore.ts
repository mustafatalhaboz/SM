import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, Task, TaskPriority } from '../lib/types';

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

// Hook return type interfaces
interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

interface UseHighPriorityTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

/**
 * Real-time hook to listen to all projects, ordered by creation date (newest first)
 */
export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe;

    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const projectsList: Project[] = [];
          querySnapshot.forEach((doc) => {
            projectsList.push(docToProject(doc));
          });
          
          setProjects(projectsList);
          setLoading(false);
          setError(null);
          console.log('Projects updated via real-time listener:', projectsList.length);
        },
        (error) => {
          console.error('Error in projects listener:', error);
          setError('Failed to load projects');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up projects listener:', error);
      setError('Failed to setup projects listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('Projects listener cleaned up');
      }
    };
  }, []);

  return { projects, loading, error };
}

/**
 * Real-time hook to listen to tasks for a specific project
 * @param projectId - ID of the project to get tasks for
 */
export function useTasks(projectId: string): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q,
        (querySnapshot) => {
          const tasksList: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksList.push(docToTask(doc));
          });

          setTasks(tasksList);
          setLoading(false);
          setError(null);
          console.log('Tasks updated via real-time listener for project:', projectId, tasksList.length);
        },
        (error) => {
          console.error('Error in tasks listener:', error);
          setError('Failed to load tasks');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up tasks listener:', error);
      setError('Failed to setup tasks listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('Tasks listener cleaned up for project:', projectId);
      }
    };
  }, [projectId]);

  return { tasks, loading, error };
}

/**
 * Real-time hook to listen to high priority tasks across all projects
 * Tasks are filtered by priority (Yüksek, Orta) and status (not Yapıldı)
 * Results are sorted by priority (highest first) and then by deadline (earliest first)
 */
export function useHighPriorityTasks(): UseHighPriorityTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe;

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('priority', 'in', ['Yüksek', 'Orta']),
        where('status', '!=', 'Yapıldı')
      );

      unsubscribe = onSnapshot(q,
        (querySnapshot) => {
          const tasksList: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksList.push(docToTask(doc));
          });

          // Custom sorting: Yüksek priority first, then by deadline
          tasksList.sort((a, b) => {
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

          setTasks(tasksList);
          setLoading(false);
          setError(null);
          console.log('High priority tasks updated via real-time listener:', tasksList.length);
        },
        (error) => {
          console.error('Error in high priority tasks listener:', error);
          setError('Failed to load high priority tasks');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up high priority tasks listener:', error);
      setError('Failed to setup high priority tasks listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('High priority tasks listener cleaned up');
      }
    };
  }, []);

  return { tasks, loading, error };
}