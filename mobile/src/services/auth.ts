// src/services/auth.ts
import { signInAnonymously } from "firebase/auth";
import { auth } from "../firebaseConfig";

export async function signInAnon() {
  try {
    const userCred = await signInAnonymously(auth);
    console.log("User signed in:", userCred.user.uid);
    return userCred.user.uid;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
  }
}
