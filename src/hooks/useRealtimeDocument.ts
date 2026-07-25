import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useRealtimeDocument(collectionName: string, documentId: string) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const writeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localDataRef = useRef<any>(null);

  useEffect(() => {
    if (!documentId) return;

    const docRef = doc(db, collectionName, documentId);
    
    // Resume Bullet #2: "Real-time platform supporting 5+ concurrent users with sub-second synchronization"
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          
          // Resume Bullet #4: "Implemented conflict resolution algorithms..."
          // Conflict Resolution: Basic Last-Write-Wins check using timestamps
          if (localDataRef.current && remoteData.updatedAt && localDataRef.current.updatedAt) {
            if (remoteData.updatedAt.toMillis && localDataRef.current.updatedAt.getTime) {
               if (remoteData.updatedAt.toMillis() < localDataRef.current.updatedAt.getTime()) {
                  return; // Ignore older remote updates
               }
            }
          }
          
          setData(remoteData);
          localDataRef.current = remoteData;
        } else {
          setData(null);
        }
      },
      (err) => setError(err)
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  // Resume Bullet #3: "Designed scalable data structures and algorithms reducing Firestore operations by 35%"
  const updateDataDebounced = (newData: any) => {
    // Optimistic UI Update for sub-second latency feel
    const mergedData = { ...localDataRef.current, ...newData, updatedAt: new Date() };
    setData(mergedData);
    localDataRef.current = mergedData;

    if (writeTimeoutRef.current) {
      clearTimeout(writeTimeoutRef.current);
    }

    // Debounce database writes to batch keystrokes and drastically reduce Firestore operations
    writeTimeoutRef.current = setTimeout(async () => {
      try {
        const docRef = doc(db, collectionName, documentId);
        await setDoc(docRef, {
          ...newData,
          updatedAt: serverTimestamp() // Server-enforced Last-Write-Wins
        }, { merge: true });
      } catch (err: any) {
        setError(err);
      }
    }, 2000); // 2 second debounce batching
  };

  return { data, updateDataDebounced, error };
}
