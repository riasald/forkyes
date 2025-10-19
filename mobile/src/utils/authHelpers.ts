import { useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) await signInAnonymously(auth);
      setUser(auth.currentUser);
      setReady(true);
    });
    return unsub;
  }, []);

  return { user, ready };
}
