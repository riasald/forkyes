"use client"

import { useEffect, useState } from "react"
import { signInAnonymously, onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "../lib/firebaseConfig"

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    console.log("[v0] Setting up auth listener")

    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("[v0] Auth state changed:", { userId: u?.uid, isAnonymous: u?.isAnonymous })

      if (!u) {
        console.log("[v0] No user found, signing in anonymously...")
        try {
          await signInAnonymously(auth)
          console.log("[v0] Anonymous sign-in successful:", auth.currentUser?.uid)
        } catch (error) {
          console.error("[v0] Anonymous sign-in failed:", error)
        }
      }
      setUser(auth.currentUser)
      setReady(true)
    })
    return unsub
  }, [])

  return { user, ready }
}
