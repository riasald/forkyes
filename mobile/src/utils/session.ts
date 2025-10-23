// session.ts
import { getDatabase, ref, set, get, child, update, onValue, off } from "firebase/database";
import { fetchRestaurantsByRadius } from "../services/backend"; // <-- confirm this path
import { app, auth } from "../lib/firebaseConfig";
import * as Location from "expo-location";

/** ---- Types ---- */
export type SessionDoc = {
  code: string;
  createdAt: number;
  hostUid: string;
  status: "waiting" | "seeding" | "ready";
  location: { lat: number; lon: number };
  maxRestaurants: number;
};

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

/** Get current lat/lon via Expo Location */
export async function getCurrentCoords(): Promise<{ lat: number; lon: number }> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location permission denied");
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { lat: loc.coords.latitude, lon: loc.coords.longitude };
}

/**
 * Create a session.
 * - Grabs current location (unless coords provided)
 * - Stores maxRestaurants default = 30
 */
export async function createSession(
  hostName: string,
  opts?: { coords?: { lat: number; lon: number }; maxRestaurants?: number }
) {
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in (anonymous is fine)");

  const coords = opts?.coords ?? (await getCurrentCoords());
  const maxRestaurants = Math.max(1, Math.min(opts?.maxRestaurants ?? 30, 100)); // clamp if you want

  const code = await createUniqueCode(db);
  const now = Date.now();

  const sessionRef = ref(db, `sessions/${code}`);
  await set(sessionRef, {
    code,
    createdAt: now,
    hostUid: user.uid,
    status: "waiting",
    location: { lat: coords.lat, lon: coords.lon },
    maxRestaurants,
  });

  // Add host as a participant
  const participantRef = ref(db, `sessions/${code}/participants/${user.uid}`);
  await set(participantRef, { name: hostName || "Host", joinedAt: now });

  return code;
}

export async function joinSession(code: string, name: string) {
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in (anonymous is fine)");
  const trimmed = code.trim().toUpperCase();

  const sessionSnap = await get(child(ref(db), `sessions/${trimmed}`));
  if (!sessionSnap.exists()) throw new Error("Session code not found");

  const participantRef = ref(db, `sessions/${trimmed}/participants/${user.uid}`);
  await update(participantRef, { name: name.trim() || "Guest", joinedAt: Date.now() });

  return trimmed;
}

/** Read the whole session once */
export async function getSession(code: string): Promise<SessionDoc | null> {
  const db = getDatabase();
  const snap = await get(child(ref(db), `sessions/${code}`));
  return (snap.val() as SessionDoc) ?? null;
}

/** Subscribe to the participants list; returns unsubscribe function */
export function subscribeParticipants(
  code: string,
  cb: (list: { uid: string; name: string }[]) => void
) {
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

/** Subscribe to the shared restaurants list for this session */
export function subscribeRestaurants(
  code: string,
  cb: (rows: { name: string; address: string }[]) => void
) {
  const db = getDatabase();
  const rRef = ref(db, `sessions/${code}/restaurants`);
  const handler = (snap: any) => cb((snap.val() as any[]) ?? []);
  onValue(rRef, handler);
  return () => off(rRef, "value", handler);
}

/**
 * Seed restaurants:
 *  - reads session.location & maxRestaurants
 *  - calls backend (Geoapify under the hood)
 *  - writes results to /sessions/{code}/restaurants
 *  - flips status to 'ready'
 */
export async function seedRestaurantsForSession(
  code: string,
  options?: { radiusMeters?: number }
) {
  const db = getDatabase();
  const s = await getSession(code);
  if (!s) throw new Error("Session not found");

  // mark seeding so UI can show a spinner
  await update(ref(db, `sessions/${code}`), { status: "seeding" });

  const radius = options?.radiusMeters ?? 5000;           // choose your default radius
  const limit = s.maxRestaurants ?? 30;                    // default 30 (already stored)
  const rows = await fetchRestaurantsByRadius(
    s.location.lat,
    s.location.lon,
    radius,
    limit
  ); // -> [{ name, address }]

  await set(ref(db, `sessions/${code}/restaurants`), rows);

  // mark ready so UI can move on
  await update(ref(db, `sessions/${code}`), { status: "ready" });

  return rows;
}
export async function recordSwipe(
  code: string,
  restaurantId: string,
  liked: boolean
) {
  const db = getDatabase();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const swipeRef = ref(
    db,
    `sessions/${code}/swipes/${restaurantId}/${user.uid}`
  );

  await set(swipeRef, liked ? true : null);

  console.log(`Recorded swipe for ${user.uid}: ${restaurantId} -> ${liked}`);
  console.log(`SWIPE RECORDED:
      Session: ${code}
      User: ${user.uid}
      Restaurant: ${restaurantId}
      Liked: ${liked}
    `);
}