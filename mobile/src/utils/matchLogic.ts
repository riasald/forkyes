import { ref, onValue, update } from "firebase/database";
import { getDatabase } from "firebase/database";

interface Participant {
  uid: string;
  name: string;
}

/** Listen for matches in a session and detect when all users like the same restaurant */
export function watchForMatches(
  sessionCode: string,
  participants: Participant[],
  onMatchFound: (restaurantId: string) => void
) {
  const db = getDatabase();
  const swipesRef = ref(db, `sessions/${sessionCode}/swipes`);

  onValue(swipesRef, async (snapshot) => {
    const swipes = snapshot.val();
    if (!swipes) return;

    // Collect all restaurant IDs from swipes
    const restaurantIds = new Set<string>();
    Object.values(swipes).forEach((userSwipes: any) => {
      Object.keys(userSwipes).forEach((rid) => restaurantIds.add(rid));
    });

    // Check each restaurant to see if everyone liked it
    for (const restaurantId of restaurantIds) {
      const allLiked = participants.every(
        (p) => swipes[p.uid]?.[restaurantId] === "like"
      );

      if (allLiked) {
        await update(ref(db, `sessions/${sessionCode}/matches`), {
          [restaurantId]: true,
        });
        onMatchFound(restaurantId);
        break;
      }
    }
  });
}
