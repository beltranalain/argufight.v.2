"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// Firebase config loaded from env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function PushManager() {
  const { data: session } = useSession();
  const userId = session?.user?.id as string | undefined;

  const registerPushNotifications = useCallback(async () => {
    if (!userId) return;
    if (!firebaseConfig.apiKey) return; // Firebase not configured

    try {
      // Only run in browser with service worker support
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // Dynamic import to avoid SSR issues
      const { initializeApp, getApps } = await import("firebase/app");
      const { getMessaging, getToken } = await import("firebase/messaging");

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const messaging = getMessaging(app);

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) return;

      const token = await getToken(messaging, { vapidKey });
      if (!token) return;

      // Register token with server
      await fetch("/api/fcm/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      // Silently fail — push notifications are a nice-to-have
      console.warn("Push notification registration failed:", err);
    }
  }, [userId]);

  useEffect(() => {
    registerPushNotifications();
  }, [registerPushNotifications]);

  // This component doesn't render anything
  return null;
}
