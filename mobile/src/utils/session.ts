import { getDatabase, ref, set, get, child, serverTimestamp, update, onValue, off } from "firebase/database";
import { auth } from "../lib/firebaseConfig";

/** Generate a 6-char uppercase code, e.g. “F7Q2MX” */
export function generateCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip confusing chars
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** Create a unique session code by checking RTDB; a few retries just in case */
async function createUniqueCode(db: ReturnType<typeof getDatabase>, retries = 5): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const code = generateCode();
    const snap = await get(child(ref(db), `sessions/${code}`));
    if (!snap.exists()) return code;
  }
  throw new Error("Could not generate a unique session code");
}

export async function createSession(hostName: string) {
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in (anonymous is fine)");

  const code = await createUniqueCode(db);
  const now = Date.now();

  const sessionRef = ref(db, `sessions/${code}`);
  await set(sessionRef, {
    code,
    createdAt: now,
    hostUid: user.uid,
    status: "waiting",
  });

  // Also add host as a participant
  const participantRef = ref(db, `sessions/${code}/participants/${user.uid}`);
  await set(participantRef, {
    name: hostName || "Host",
    joinedAt: now,
  });

  return code;
}

export async function joinSession(code: string, name: string) {
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in (anonymous is fine)");
  const trimmed = code.trim().toUpperCase();

  // Verify session exists
  const sessionSnap = await get(child(ref(db), `sessions/${trimmed}`));
  if (!sessionSnap.exists()) {
    throw new Error("Session code not found");
  }

  // Write participant
  const participantRef = ref(db, `sessions/${trimmed}/participants/${user.uid}`);
  await update(participantRef, {
    name: name.trim() || "Guest",
    joinedAt: Date.now(),
  });

  return trimmed;
}

/** Subscribe to the participants list; returns unsubscribe function */
export function subscribeParticipants(code: string, cb: (list: { uid: string; name: string }[]) => void) {
  const db = getDatabase();
  const participantsRef = ref(db, `sessions/${code}/participants`);

  const handler = (snap: any) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([uid, v]: any) => ({ uid, name: v.name || "Guest" }));
    cb(list);
  };
  onValue(participantsRef, handler);

  return () => off(participantsRef, "value", handler);
}

/** Record a swipe (like or dislike) for a restaurant */
export async function recordSwipe(sessionCode: string, restaurantId: string, liked: boolean) {
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in");

  const swipeRef = ref(db, `sessions/${sessionCode}/swipes/${user.uid}/${restaurantId}`);
  await set(swipeRef, liked ? "like" : "dislike");
}

/** Listen for all swipes in this session */
export function subscribeSwipes(sessionCode: string, callback: (swipes: any) => void) {
  const db = getDatabase();
  const swipesRef = ref(db, `sessions/${sessionCode}/swipes`);
  onValue(swipesRef, (snap) => {
    callback(snap.val() || {});
  });
}
