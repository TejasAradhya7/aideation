import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from './usePresence';

export interface ActivityLog {
  id?: string;
  workspaceId: string;
  employeeName: string;
  employeeId: string;
  role: string;
  action: string;
  taskTitle: string;
  timestamp?: any;
  timeString?: string;
}

export function useActivityFeed(currentUser: UserProfile | null) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const workspaceId = currentUser
    ? `${currentUser.companyName}_${currentUser.projectName}`
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '_')
    : 'default';

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'activities'),
      where('workspaceId', '==', workspaceId),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: ActivityLog[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as ActivityLog;
        const time = data.timestamp?.toDate 
          ? data.timestamp.toDate().toLocaleTimeString() 
          : new Date().toLocaleTimeString();

        logs.push({
          id: docSnap.id,
          ...data,
          timeString: time,
        });
      });

      // Sort logs by newest first
      logs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setActivities(logs);
    }, (err) => {
      console.warn("Activity feed query fallback:", err.message);
    });

    return () => unsubscribe();
  }, [currentUser, workspaceId]);

  const logActivity = async (action: string, taskTitle: string) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'activities'), {
        workspaceId,
        employeeName: currentUser.name,
        employeeId: currentUser.employeeId,
        role: currentUser.role,
        action,
        taskTitle,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Failed to log activity:", err);
    }
  };

  return { activities, logActivity };
}
