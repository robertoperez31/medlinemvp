import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';
import { syncManager } from '@/lib/sync/offlineSync';
import { useAuthStore } from '@/lib/stores/authStore';

export function useOfflineData() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const wasOfflineRef = useRef(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);

      if (online && wasOfflineRef.current && user) {
        wasOfflineRef.current = false;
        await autoSync();
      } else if (!online) {
        wasOfflineRef.current = true;
      }
    });

    checkPending();
    return unsubscribe;
  }, [user]);

  async function checkPending() {
    const count = await syncManager.getPendingCount();
    setPendingSync(count);
  }

  async function autoSync() {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncManager.syncToCloud(user.id);
      await checkPending();
    } finally {
      setIsSyncing(false);
    }
  }

  async function manualSync() {
    if (!user) return;
    await autoSync();
  }

  return { isOnline, pendingSync, isSyncing, manualSync, checkPending };
}
