// app/index.tsx (or app/(tabs)/index.tsx)
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  Dimensions,
  StyleSheet, // Import StyleSheet
  Button, // Import Button
} from "react-native";
import { useLocalSearchParams, router } from "expo-router"; // Import router
import Swiper from "react-native-deck-swiper"; // Import the swiper
import {
  subscribeRestaurants,
  seedRestaurantsForSession,
} from "../../src/utils/session";
import { getRestaurantImageByName } from "../../assets/restaurantImages";


type Row = { name: string; address: string; photoUrl?: string };

export default function HomeTab() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allSwiped, setAllSwiped] = useState(false); // State for when stack is empty

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeRestaurants(code, (list: Row[]) => {
      setRows(list);
      setAllSwiped(false); // Reset swiped state when new cards load
      setLoading(false);
    });
    return unsub;
  }, [code]);

  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        await seedRestaurantsForSession(code, { radiusMeters: 5000 });
      } catch (e: any) {
        setError(e.message || "Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const onRefresh = useCallback(async () => {
    if (!code) return;
    try {
      setRefreshing(true);
      await seedRestaurantsForSession(code, { radiusMeters: 5000 });
    } finally {
      setRefreshing(false);
    }
  }, [code]);

  if (!code) {
    return (
      <Centered>
        <Text style={{ fontSize: 16, color: "#444", textAlign: "center" }}>
          Missing session code.
        </Text>
        <View style={{ marginTop: 20 }}>
          <Button title="Back to Home" onPress={() => router.push("/")} />
        </View>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#666" }}>
          Finding nearby restaurants…
        </Text>
      </Centered>
    );
  }

  if ((rows.length === 0 || allSwiped) && !loading) {
    return (
      <Centered>
        <Text style={{ fontSize: 18, color: "#555", textAlign: "center" }}>
          {allSwiped
            ? "You've seen all the restaurants!"
            : "No restaurants found."}
        </Text>
        <Text style={{ color: "#888", textAlign: "center", marginVertical: 16 }}>
          Try expanding your search radius or refresh.
        </Text>
        <Button
          title={refreshing ? "Refreshing..." : "Refresh Now"}
          onPress={onRefresh}
          disabled={refreshing}
        />
      </Centered>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {error ? (
        <Text style={{ color: "red", padding: 12, textAlign: "center" }}>
          {error}
        </Text>
      ) : null}

      <Swiper
        cards={rows}
        renderCard={(card: Row) => <RestaurantCard item={card} />}
        onSwipedLeft={(cardIndex) => {
          console.log("Swiped LEFT on:", rows[cardIndex].name);
        }}
        onSwipedRight={(cardIndex) => {
          console.log("Swiped RIGHT on:", rows[cardIndex].name);
        }}
        onSwipedAll={() => {
          console.log("onSwipedAll");
          setAllSwiped(true);
        }}
        cardIndex={0}
        backgroundColor={"transparent"}
        stackSize={3} // Show 3 cards in the stack
        stackSeparation={15} // How much the cards below peek out
        verticalSwipe={false} // Disable swiping up/down
        animateOverlayLabelsOpacity
        overlayLabels={{
          left: {
            title: "FORK NO",
            style: {
              label: styles.overlayLabel,
              wrapper: styles.overlayWrapperLeft,
            },
          },
          right: {
            title: "FORK YES",
            style: {
              label: styles.overlayLabel,
              wrapper: styles.overlayWrapperRight,
            },
          },
        }}
      />
    </View>
  );
}

function RestaurantCard({ item }: { item: Row }) {
  const localImg = getRestaurantImageByName(item.name);

  const src = localImg
    ? localImg
    : item.photoUrl
    ? { uri: item.photoUrl }
    : { uri: `https://picsum.photos/seed/${encodeURIComponent(item.name)}/1200/800` };

  const { width, height } = Dimensions.get("window");
  return (
    <View
      style={{
        width: width - 48,
        height: height * 0.65,
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
      }}
    >
      <Image source={src} resizeMode="cover" style={{ width: "100%", height: "70%" }} />
      <View style={{ padding: 14, flex: 1 }}>
        <Text numberOfLines={1} style={{ fontWeight: "700", fontSize: 18, color: "#222" }}>
          {item.name}
        </Text>
        <Text numberOfLines={2} style={{ color: "#666", marginTop: 4 }}>
          {item.address}
        </Text>
      </View>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fafafa",
      }}
    >
      {children}
    </View>
  );
}

// --- Add StyleSheet for overlay labels ---
const styles = StyleSheet.create({
  overlayLabel: {
    fontSize: 45,
    fontWeight: "bold",
    color: "white",
    padding: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  overlayWrapperLeft: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginTop: 30,
    marginLeft: -30,
    transform: [{ rotate: "15deg" }],
    borderColor: "red",
    borderWidth: 4,
    borderRadius: 10,
  },
  overlayWrapperRight: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 30,
    marginLeft: 30,
    transform: [{ rotate: "-15deg" }],
    borderColor: "green",
    borderWidth: 4,
    borderRadius: 10,
  },
});