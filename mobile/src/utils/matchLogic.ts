import { ref, onValue, update, get } from "firebase/database"
import { getDatabase } from "firebase/database"

interface Participant {
  uid: string
  name: string
}

export function subscribeMatches(sessionCode: string, onMatchesUpdate: (matchedRestaurantIds: string[]) => void) {
  const db = getDatabase()
  const matchesRef = ref(db, `sessions/${sessionCode}/matches`)

  console.log(`[v0] subscribeMatches - Subscribing to path: sessions/${sessionCode}/matches`)

  const unsubscribe = onValue(matchesRef, (snapshot) => {
    const data = snapshot.val()
    console.log(`[v0] subscribeMatches - Firebase snapshot received:`, {
      exists: snapshot.exists(),
      data: data,
      type: typeof data,
      keys: data ? Object.keys(data) : [],
      path: snapshot.ref.toString(),
    })

    if (data) {
      const matchIds = Object.keys(data).filter((key) => data[key] === true)
      console.log(`[v0] subscribeMatches - Returning ${matchIds.length} matched IDs:`, matchIds)
      onMatchesUpdate(matchIds)
    } else {
      console.log(`[v0] subscribeMatches - No matches data, returning empty array`)
      onMatchesUpdate([])
    }
  })

  return () => {
    console.log(`[v0] subscribeMatches - Unsubscribing from sessions/${sessionCode}/matches`)
    unsubscribe()
  }
}

/** Listen for matches in a session and detect when all users like the same restaurant */
export function watchForMatches(
  sessionCode: string,
  participants: Participant[],
  onMatchFound: (restaurantId: string) => void,
) {
  const db = getDatabase()
  const swipesRef = ref(db, `sessions/${sessionCode}/swipes`)

  console.log("[v0] watchForMatches - Starting to watch for matches with participants:", participants)

  const unsubscribe = onValue(swipesRef, async (snapshot) => {
    const swipes = snapshot.val()
    if (!swipes) {
      console.log("[v0] watchForMatches - No swipes data yet")
      return
    }

    console.log("[v0] watchForMatches - Swipes data received:", swipes)

    // Collect all restaurant IDs that have been swiped on
    const restaurantIds = new Set<string>()
    Object.values(swipes).forEach((userSwipes: any) => {
      if (userSwipes && typeof userSwipes === "object") {
        Object.keys(userSwipes).forEach((rid) => restaurantIds.add(rid))
      }
    })

    console.log("[v0] watchForMatches - Restaurant IDs that have been swiped:", Array.from(restaurantIds))

    // Check each restaurant to see if everyone liked it
    for (const restaurantId of restaurantIds) {
      // Check if all participants have liked this restaurant
      const allLiked = participants.every((p) => swipes[p.uid]?.[restaurantId] === "like")

      console.log(`[v0] watchForMatches - Checking restaurant ${restaurantId}:`, {
        allLiked,
        participantLikes: participants.map((p) => ({
          uid: p.uid,
          name: p.name,
          liked: swipes[p.uid]?.[restaurantId],
        })),
      })

      if (allLiked) {
        const matchesRef = ref(db, `sessions/${sessionCode}/matches`)
        const matchesSnapshot = await get(matchesRef)
        const existingMatches = matchesSnapshot.val() || {}

        if (!existingMatches[restaurantId]) {
          // Only create match and notify if it doesn't exist yet
          console.log(`[v0] watchForMatches - Creating new match for restaurant ${restaurantId}`)
          await update(ref(db, `sessions/${sessionCode}/matches`), {
            [restaurantId]: true,
          })
          onMatchFound(restaurantId)
        } else {
          console.log(`[v0] watchForMatches - Match already exists for restaurant ${restaurantId}`)
        }
      }
    }
  })

  return unsubscribe
}
