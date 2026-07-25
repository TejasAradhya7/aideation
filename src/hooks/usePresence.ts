import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserProfile {
  id: string;
  employeeId: string;
  companyName: string;
  projectName: string;
  name: string;
  email: string;
  role: 'Lead Architect' | 'Senior Software Engineer' | 'Frontend Engineer' | 'Backend Engineer' | 'Product Manager' | 'UI/UX Designer';
  lastActive?: number;
  activeTabsCount?: number;
}

export function usePresence(currentUser: UserProfile | null) {
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!currentUser || !currentUser.companyName || !currentUser.projectName) return;

    // Standardized workspace ID slug
    const workspaceSlug = `${currentUser.companyName}_${currentUser.projectName}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');

    // STRICT DEDUPLICATION FIX: Key document by workspace + employeeId (NOT random tab ID)
    // This ensures all tabs opened by EMP-1001 map to the EXACT SAME document!
    const documentKey = `${workspaceSlug}_${currentUser.employeeId}`;
    const presenceRef = doc(db, 'presence', documentKey);

    const channel = new BroadcastChannel(`presence_${workspaceSlug}`);

    // 1. Heartbeat Function
    const updatePresence = async () => {
      const payload = {
        id: documentKey,
        employeeId: currentUser.employeeId,
        companyName: currentUser.companyName,
        projectName: currentUser.projectName,
        workspaceId: workspaceSlug,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        lastActive: Date.now(),
      };

      try {
        channel.postMessage(payload);
      } catch (e) {}

      try {
        await setDoc(presenceRef, payload);
      } catch (err) {
        // Fallback gracefully if offline
      }
    };

    updatePresence();
    const heartbeatInterval = setInterval(updatePresence, 6000);

    const collaboratorsMap = new Map<string, UserProfile>();
    collaboratorsMap.set(currentUser.employeeId, { ...currentUser, lastActive: Date.now() });

    channel.onmessage = (event) => {
      if (event.data && event.data.employeeId) {
        collaboratorsMap.set(event.data.employeeId, event.data);
        refreshActiveList();
      }
    };

    const refreshActiveList = () => {
      const now = Date.now();
      const uniqueEmployeesMap = new Map<string, UserProfile>();
      
      collaboratorsMap.forEach((user) => {
        // STRICT DEDUPLICATION: Count as active if heartbeat is within 45s
        if (user.employeeId && (!user.lastActive || now - user.lastActive < 45000)) {
          uniqueEmployeesMap.set(user.employeeId, user);
        }
      });

      const deduplicatedList = Array.from(uniqueEmployeesMap.values());
      if (deduplicatedList.length > 0) {
        setActiveUsers(deduplicatedList);
      }
    };

    // 2. Query Firestore with Strict Employee ID Deduplication
    const presenceQuery = query(
      collection(db, 'presence'),
      where('workspaceId', '==', workspaceSlug)
    );

    const unsubscribe = onSnapshot(presenceQuery, (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data.employeeId) {
          collaboratorsMap.set(data.employeeId, data);
        }
      });
      refreshActiveList();
    }, (err) => {
      console.warn("Firestore presence query warning:", err.message);
      refreshActiveList();
    });

    const handleUnload = () => {
      deleteDoc(presenceRef).catch(() => {});
      try {
        channel.postMessage({ type: 'LEAVE', employeeId: currentUser.employeeId });
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(heartbeatInterval);
      unsubscribe();
      channel.close();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser]);

  return activeUsers;
}
