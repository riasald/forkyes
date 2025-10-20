import Swiper from 'react-native-deck-swiper';
import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { recordSwipe } from "../utils/session"; // Assuming this function exists

const { width } = Dimensions.get("window");

// Consistent Restaurant Interface (consider moving to types.ts)
interface Restaurant {
  id: string;
  name: string;
  image: string; // Ensure this is always provided if SwipeScreen uses it
  address: string;
}

interface Props {
  sessionCode: string;
  restaurants: Restaurant[];
}

export default function SwipeScreenComponent({ sessionCode, restaurants }: Props) {
  const [cardIndex, setCardIndex] = useState(0);

  // Use the correct type for index (number)
  const handleSwipe = async (index: number, direction: 'left' | 'right') => {
    const restaurant = restaurants[index];
    // Ensure restaurant exists before proceeding
    if (!restaurant) {
      console.warn(`Swiped on invalid index: ${index}`);
      return;
    }
    const liked = direction === "right";
    try {
      await recordSwipe(sessionCode, restaurant.id, liked);
    } catch (error) {
      console.error("Failed to record swipe:", error);
      // Optional: Add user feedback here if recording fails
    }
    // No need to manually setCardIndex, Swiper handles advancing the index internally
    // setCardIndex(index + 1); // Remove this line
  };

  const handleSwipedAll = () => {
    console.log("No more restaurants to swipe!");
    // Optional: Navigate away or show a different message
  };

  return (
    <View style={styles.container}>
      {/* Title consistency: Adjusted fontWeight slightly */}
      <Text style={styles.title}>Swipe to Choose 🍽️</Text>
      <Swiper
        cards={restaurants}
        cardIndex={cardIndex}
        // Use the correct type for the card data
        renderCard={(restaurant: Restaurant | undefined) => {
          if (!restaurant) {
            // This view is shown when cards run out
            return (
              <View style={[styles.card, styles.doneCard]}>
                <Text style={styles.doneText}>All restaurants swiped!</Text>
                <Text style={styles.doneTextSmall}>Waiting for matches...</Text>
              </View>
            );
          }
          return (
            <View style={styles.card}>
              <Image source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
              <View style={styles.textContainer}>
                 <Text style={styles.name}>{restaurant.name}</Text>
                 <Text style={styles.address}>{restaurant.address}</Text>
              </View>
            </View>
          );
        }}
        // Use the correct type for the index (number)
        onSwipedRight={(index: number) => handleSwipe(index, "right")}
        onSwipedLeft={(index: number) => handleSwipe(index, "left")}
        onSwipedAll={handleSwipedAll} // Handle running out of cards
        backgroundColor="#fafafa"
        stackSize={3}
        stackSeparation={15} // Added for better visual separation
        overlayLabels={{
          left: { title: 'NOPE', style: { label: styles.overlayLabel, wrapper: styles.overlayWrapperLeft } },
          right: { title: 'LIKE', style: { label: styles.overlayLabel, wrapper: styles.overlayWrapperRight } },
        }}
        animateOverlayLabelsOpacity
        verticalSwipe={false} // Keep vertical swipe disabled
        cardVerticalMargin={50} // Adjust vertical margin if needed
        containerStyle={styles.swiperContainer} // Added for potential swiper specific layout
      />
    </View>
  );
}

// Styles adjusted for consistency and clarity
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center", // Swiper handles positioning, center might conflict
    backgroundColor: '#fafafa', // Ensure background consistency
    paddingTop: 50, // Add some padding at the top
  },
   swiperContainer: {
    flex: 1, // Ensure Swiper takes up available space below title
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold", // Consistent with MatchScreen
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flex: 0.8, // Adjust height relative to container
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start", // Align image at the top
    alignItems: "center",
    elevation: 4, // Slightly reduced elevation
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden', // Ensure image corners are clipped
  },
  doneCard: {
     justifyContent: 'center', // Center content for the "done" card
     alignItems: 'center',
  },
   doneText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
   doneTextSmall: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: '70%', // Adjust image height percentage
    // Removed border radius here, handled by card's overflow: 'hidden'
  },
   textContainer: {
    padding: 15,
    alignItems: 'center', // Center text below image
    width: '100%',
  },
  name: {
    fontSize: 20,
    fontWeight: "bold", // Consistent with MatchScreen style concept
    textAlign: 'center',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: "#666", // Consistent with MatchScreen
    textAlign: 'center',
  },
  overlayLabel: {
    fontSize: 45,
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden',
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 30,
    marginLeft: -30,
    borderColor: 'red',
    borderWidth: 2,
  },
   overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 30,
    marginLeft: 30,
     borderColor: 'green',
     borderWidth: 2,
  },
});