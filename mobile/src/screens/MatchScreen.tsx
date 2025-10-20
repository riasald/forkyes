import React, { useEffect, useState } from "react";
import { View, Text, Button, Linking, StyleSheet, Image } from "react-native"; // Added Image
import { getDatabase, ref, onValue, DataSnapshot } from "firebase/database";

// Consistent Restaurant Interface (consider moving to types.ts)
interface Restaurant {
  id: string;
  name: string;
  image: string; // Add image here for consistency, even if not displayed initially
  address: string;
}

interface Props {
  sessionCode: string;
  // Use the Restaurant interface for props consistency
  restaurants: Restaurant[];
}

export default function MatchScreenComponent({ sessionCode, restaurants }: Props) {
  // Use the Restaurant interface for state consistency
  const [match, setMatch] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (!sessionCode) return; // Add guard clause

    const db = getDatabase();
    const matchRef = ref(db, `sessions/${sessionCode}/matches`);

    const unsubscribe = onValue(matchRef, (snap: DataSnapshot) => {
      const data = snap.val();
      if (data) {
        // Find the match ID - simple approach assuming one key
        const matchIds = Object.keys(data);
        const firstMatchId = matchIds.length > 0 ? matchIds[0] : null;

        if (firstMatchId) {
          const matchedRestaurant = restaurants.find((r) => r.id === firstMatchId);
          if (matchedRestaurant) {
            setMatch(matchedRestaurant);
          } else {
             console.warn(`Matched restaurant ID ${firstMatchId} not found in provided list.`);
             setMatch(null); // Reset if not found
          }
        } else {
          setMatch(null); // Handle case where match data exists but is empty
        }
      } else {
        setMatch(null); // Handle case where there's no match data yet
      }
    }, (error) => {
        console.error("Firebase onValue error:", error);
        // Optional: Handle read errors, e.g., set an error state
    });

    // Clean up the listener
    return () => unsubscribe();

  }, [sessionCode, restaurants]); // Keep dependencies

  // --- Render Logic ---

  if (!match) {
    return (
      <View style={styles.waitContainer}>
        <Text style={styles.waitText}>Waiting for a match...</Text>
        {/* Optional: Add an activity indicator */}
      </View>
    );
  }

  // Function to open maps
  const openMap = () => {
    // Use address for better accuracy in map search
    const query = encodeURIComponent(match.address);
    // Standard Google Maps search URL (works on web and mobile should prompt)
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
       {/* Optional: Display matched image */}
      {match.image && (
         <Image source={{ uri: match.image }} style={styles.image} resizeMode="cover"/>
      )}
      <Text style={styles.title}>🎉 Match Found!</Text>
      <Text style={styles.name}>{match.name}</Text>
      <Text style={styles.address}>{match.address}</Text>
      <Button
        title="Open in Google Maps"
        onPress={openMap} // Use the handler function
      />
    </View>
  );
}

// Styles adjusted slightly for consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#fafafa', // Match SwipeScreen background
  },
  waitContainer: { // Separate style for waiting state
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#fafafa',
  },
  waitText: {
    textAlign: "center",
    fontSize: 18,
    color: '#555', // Softer color for waiting text
  },
  title: {
    fontSize: 24,
    fontWeight: "bold", // Consistent with SwipeScreen concept
    marginBottom: 15, // Adjusted margin
    textAlign: 'center',
  },
   image: { // Optional style for matched image
     width: '90%',
     height: 200, // Adjust size as needed
     borderRadius: 15,
     marginBottom: 20,
   },
  name: {
    fontSize: 22, // Slightly larger for emphasis
    fontWeight: "bold", // Consistent styling concept
    textAlign: 'center',
    marginBottom: 8, // Adjusted margin
  },
  address: {
    fontSize: 16,
    marginBottom: 30, // More space before button
    color: "#666", // Consistent with SwipeScreen
    textAlign: 'center',
  },
});