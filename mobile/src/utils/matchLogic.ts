import { ref, onValue, update, get } from "firebase/database"
import { getDatabase } from "firebase/database"

interface Participant {
  uid: string
  name: string
}

export function subscribeMatches(sessionCode: string, onMatchesUpdate: (matchedRestaurantIds: string[]) => void) {
  const db = getDatabase()
  const matchesRef = ref(db, `sessions/${sessionCode}/matches`)

  const unsubscribe = onValue(matchesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      const matchIds = Object.keys(data).filter((key) => data[key] === true)
      onMatchesUpdate(matchIds)
    } else {
      onMatchesUpdate([])
    }
  })

  return unsubscribe
}

/** Listen for matches in a session and detect when all users like the same restaurant */
export function watchForMatches(
  sessionCode: string,
  participants: Participant[],
  onMatchFound: (restaurantId: string) => void,
) {
  const db = getDatabase()
  const swipesRef = ref(db, `sessions/${sessionCode}/swipes`)

  const unsubscribe = onValue(swipesRef, async (snapshot) => {
    const swipes = snapshot.val()
    if (!swipes) return

    // Collect all restaurant IDs that have been swiped on
    const restaurantIds = new Set<string>()
    Object.values(swipes).forEach((userSwipes: any) => {
      if (userSwipes && typeof userSwipes === "object") {
        Object.keys(userSwipes).forEach((rid) => restaurantIds.add(rid))
      }
    })

    // Check each restaurant to see if everyone liked it
    for (const restaurantId of restaurantIds) {
      // Check if all participants have liked this restaurant
      const allLiked = participants.every((p) => swipes[p.uid]?.[restaurantId] === "like")

      if (allLiked) {
        const matchesRef = ref(db, `sessions/${sessionCode}/matches`)
        const matchesSnapshot = await get(matchesRef)
        const existingMatches = matchesSnapshot.val() || {}

        if (!existingMatches[restaurantId]) {
          // Only create match and notify if it doesn't exist yet
          await update(ref(db, `sessions/${sessionCode}/matches`), {
            [restaurantId]: true,
          })
          onMatchFound(restaurantId)
        }
      }
    }
  })

  return unsubscribe
}
