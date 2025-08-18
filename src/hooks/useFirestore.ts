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
import { Project, Task, TaskPriority, TaskWithProject } from '../lib/types';
import { logger } from '../lib/logger';
import { migrateProjectOrder } from '../lib/migration';

// Helper function to convert Firestore document to Project
function docToProject(doc: QueryDocumentSnapshot<DocumentData>): Project {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    createdAt: data.createdAt,
    order: data.order ?? 0 // Default to 0 if not set (migration support)
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
    assignedPerson: data.assignedPerson || '',
    status: data.status,
    type: data.type || 'Operasyon',
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

interface UseHighPriorityTasksWithProjectsReturn {
  tasks: TaskWithProject[];
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
  const [mounted, setMounted] = useState<boolean>(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let unsubscribe: Unsubscribe;

    try {
      const projectsRef = collection(db, 'projects');
      // Order by custom order field (for drag & drop), fallback to creation date
      const q = query(projectsRef, orderBy('order', 'asc'), orderBy('createdAt', 'desc'));
      
      // Run migration first time when projects are loaded
      migrateProjectOrder();

      unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const projectsList: Project[] = [];
          querySnapshot.forEach((doc) => {
            projectsList.push(docToProject(doc));
          });
          
          setProjects(projectsList);
          setLoading(false);
          setError(null);
          logger.debug('Projects real-time update', { count: projectsList.length });
        },
        (error) => {
          logger.error('Projects listener failed', { error });
          setError('Failed to load projects');
          setLoading(false);
        }
      );
    } catch (error) {
      logger.error('Projects listener setup failed', { error });
      setError('Failed to setup projects listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        logger.componentCleanup('useProjects');
      }
    };
  }, [mounted]);

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
  const [mounted, setMounted] = useState<boolean>(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !projectId) {
      if (!projectId) {
        setTasks([]);
        setLoading(false);
      }
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('projectId', '==', projectId)
      );

      unsubscribe = onSnapshot(q,
        (querySnapshot) => {
          const tasksList: Task[] = [];
          querySnapshot.forEach((doc) => {
            const task = docToTask(doc);
            tasksList.push(task);
            logger.debug('Task received in listener', {
              taskId: task.id,
              projectId: task.projectId,
              title: task.title,
              status: task.status,
              timestamp: new Date().toISOString()
            } as Record<string, unknown>);
          });

          setTasks(tasksList);
          setLoading(false);
          setError(null);
          logger.debug('Tasks real-time update completed', { 
            projectId, 
            count: tasksList.length,
            taskIds: tasksList.map(t => t.id),
            timestamp: new Date().toISOString()
          } as Record<string, unknown>);
        },
        (error) => {
          logger.error('Tasks listener failed', { projectId, error });
          setError('Failed to load tasks');
          setLoading(false);
        }
      );
    } catch (error) {
      logger.error('Tasks listener setup failed', { projectId, error });
      setError('Failed to setup tasks listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        logger.componentCleanup('useTasks');
      }
    };
  }, [mounted, projectId]);

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
  const [mounted, setMounted] = useState<boolean>(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let unsubscribe: Unsubscribe;

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('priority', 'in', ['Yüksek', 'Orta'])
      );

      unsubscribe = onSnapshot(q,
        (querySnapshot) => {
          const tasksList: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksList.push(docToTask(doc));
          });

          // Filter out completed tasks and sort
          const filteredTasks = tasksList.filter(task => task.status !== 'Yapıldı');
          
          // Custom sorting: Yüksek priority first, then by deadline
          filteredTasks.sort((a, b) => {
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

          setTasks(filteredTasks);
          setLoading(false);
          setError(null);
          logger.debug('High priority tasks real-time update', { count: filteredTasks.length });
        },
        (error) => {
          logger.error('High priority tasks listener failed', { error });
          setError('Failed to load high priority tasks');
          setLoading(false);
        }
      );
    } catch (error) {
      logger.error('High priority tasks listener setup failed', { error });
      setError('Failed to setup high priority tasks listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        logger.componentCleanup('useHighPriorityTasks');
      }
    };
  }, [mounted]);

  return { tasks, loading, error };
}

/**
 * Enhanced hook to get high priority tasks with project names
 * Combines tasks with their associated project information for dashboard display
 */
export function useHighPriorityTasksWithProjects(): UseHighPriorityTasksWithProjectsReturn {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let tasksUnsubscribe: Unsubscribe;
    let projectsUnsubscribe: Unsubscribe;

    try {
      // Create a map to store project names
      const projectsMap = new Map<string, string>();

      // Listen to projects first
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, orderBy('createdAt', 'desc'));

      projectsUnsubscribe = onSnapshot(projectsQuery, 
        (projectsSnapshot) => {
          // Update projects map
          projectsMap.clear();
          projectsSnapshot.forEach((doc) => {
            const project = docToProject(doc);
            projectsMap.set(project.id, project.name);
          });

          // Now listen to tasks
          const tasksRef = collection(db, 'tasks');
          const tasksQuery = query(
            tasksRef,
            where('priority', 'in', ['Yüksek', 'Orta'])
          );

          // Clean up existing tasks subscription if it exists
          if (tasksUnsubscribe) {
            tasksUnsubscribe();
          }

          tasksUnsubscribe = onSnapshot(tasksQuery,
            (tasksSnapshot) => {
              const tasksList: TaskWithProject[] = [];
              tasksSnapshot.forEach((doc) => {
                const task = docToTask(doc);
                const projectName = projectsMap.get(task.projectId) || 'Bilinmeyen Proje';
                
                // Only include tasks that are not completed
                if (task.status !== 'Yapıldı') {
                  tasksList.push({
                    ...task,
                    projectName
                  });
                }
              });
              
              // Custom sorting: Priority first, then deadline
              const priorityOrder: Record<TaskPriority, number> = {
                'Yüksek': 3,
                'Orta': 2,
                'Düşük': 1
              };
              
              tasksList.sort((a, b) => {
                // First sort by priority (highest first)
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                // Then sort by deadline (earliest first)
                return a.deadline.getTime() - b.deadline.getTime();
              });
              
              setTasks(tasksList);
              setLoading(false);
              setError(null);
              logger.debug('High priority tasks with projects update', { count: tasksList.length });
            },
            (tasksError) => {
              logger.error('High priority tasks with projects (tasks) listener failed', { error: tasksError });
              setError('Failed to load high priority tasks');
              setLoading(false);
            }
          );
        },
        (projectsError) => {
          logger.error('High priority tasks with projects (projects) listener failed', { error: projectsError });
          setError('Failed to load projects for tasks');
          setLoading(false);
        }
      );
    } catch (error) {
      logger.error('High priority tasks with projects listener setup failed', { error });
      setError('Failed to setup high priority tasks listener');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (tasksUnsubscribe) {
        tasksUnsubscribe();
      }
      if (projectsUnsubscribe) {
        projectsUnsubscribe();
      }
      logger.componentCleanup('useHighPriorityTasksWithProjects');
    };
  }, [mounted]);

  return { tasks, loading, error };
}