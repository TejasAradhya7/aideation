import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task } from '../types/Task';

export function useTaskSync(taskId: string, defaultTitle = "New Collaborative Task") {
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [activeTypingUser, setActiveTypingUser] = useState<string | null>(null);
  
  const serverTaskRef = useRef<Task | null>(null);
  const localEditsRef = useRef<Partial<Task>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Google Docs Style Typing Presence via BroadcastChannel
  useEffect(() => {
    if (!taskId) return;

    const typingChannel = new BroadcastChannel(`typing_${taskId}`);
    typingChannel.onmessage = (event) => {
      if (event.data?.type === 'TYPING_START') {
        setActiveTypingUser(event.data.name);
      } else if (event.data?.type === 'TYPING_STOP') {
        setActiveTypingUser(null);
      }
    };

    return () => {
      typingChannel.close();
    };
  }, [taskId]);

  // Real-time Listener & Auto-Seeding
  useEffect(() => {
    if (!taskId) return;

    const fallbackTask: Task = {
      id: taskId,
      title: defaultTitle,
      description: "",
      status: "in-progress",
    };

    const fallbackTimer = setTimeout(() => {
      setTask((prev) => prev || fallbackTask);
    }, 1500);

    try {
      const taskRef = doc(db, 'tasks', taskId);
      const unsubscribe = onSnapshot(
        taskRef,
        async (snapshot) => {
          clearTimeout(fallbackTimer);
          if (snapshot.exists()) {
            const serverData = snapshot.data({ serverTimestamps: 'estimate' }) as Task;
            serverTaskRef.current = serverData;

            // Only overlay local edits if user is actively typing (debounce timer running)
            if (debounceRef.current) {
              setTask({ ...serverData, ...localEditsRef.current });
            } else {
              localEditsRef.current = {};
              setTask(serverData);
            }
            setError(null);
          } else {
            // Document doesn't exist yet - seed it
            try {
              await setDoc(taskRef, { ...fallbackTask, lastUpdatedAt: serverTimestamp() });
              serverTaskRef.current = fallbackTask;
              setTask(fallbackTask);
            } catch (seedErr: any) {
              console.warn("Firestore seed failed:", seedErr.message);
              setError(seedErr);
              setTask(fallbackTask);
            }
          }
        },
        (err) => {
          clearTimeout(fallbackTimer);
          console.warn("onSnapshot error:", err.message);
          setError(err);
          setTask((prev) => prev || fallbackTask);
        }
      );

      return () => {
        unsubscribe();
        clearTimeout(fallbackTimer);
      };
    } catch (err: any) {
      clearTimeout(fallbackTimer);
      console.warn("Firebase app error:", err);
      setError(err);
      setTask(fallbackTask);
    }
  }, [taskId, defaultTitle]);

  // Field-Level Debounced Updates (ALL employees can write)
  const updateTaskField = useCallback((updates: Partial<Task>, authorName?: string) => {
    // Broadcast typing indicator to co-workers
    if (authorName) {
      try {
        const ch = new BroadcastChannel(`typing_${taskId}`);
        ch.postMessage({ type: 'TYPING_START', name: authorName });
      } catch (e) {}
    }

    localEditsRef.current = { ...localEditsRef.current, ...updates };

    // Optimistic UI update
    setTask((prev) => {
      const base = prev || { id: taskId, title: defaultTitle, description: "", status: "todo" };
      return { ...base, ...updates };
    });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce by 800ms before flushing to Firestore
    debounceRef.current = setTimeout(async () => {
      const pendingUpdates = { ...localEditsRef.current };
      localEditsRef.current = {};
      debounceRef.current = null;

      // Stop typing broadcast
      try {
        const ch = new BroadcastChannel(`typing_${taskId}`);
        ch.postMessage({ type: 'TYPING_STOP' });
      } catch (e) {}

      // Build clean payload (strip undefined values)
      const cleanPayload: Record<string, any> = {};
      Object.entries(pendingUpdates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanPayload[key] = value;
        }
      });

      if (Object.keys(cleanPayload).length === 0) return;

      const taskRef = doc(db, 'tasks', taskId);

      // ALWAYS use setDoc with merge: true
      // This guarantees writes succeed for ALL employees regardless of whether
      // the document exists or not, and avoids Firestore security rule timestamp
      // comparison rejections that were silently blocking non-EMP-1001 writes.
      try {
        await setDoc(taskRef, {
          ...cleanPayload,
          lastUpdatedAt: serverTimestamp(),
        }, { merge: true });
        setError(null);
      } catch (err: any) {
        console.warn("Failed to sync task:", err.message);
        setError(err);
        // Revert optimistic UI on failure
        if (serverTaskRef.current) {
          setTask(serverTaskRef.current);
          localEditsRef.current = {};
        }
      }
    }, 800);
  }, [taskId, defaultTitle]);

  return { task, updateTaskField, error, activeTypingUser };
}
