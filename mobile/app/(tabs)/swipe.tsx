// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  subscribeRestaurants,
  seedRestaurantsForSession,
  RestaurantRow, // Import the type from your session utility
} from "../../src/utils/session";
import SwipeScreenComponent from "../../src/screens/SwipeScreen"; // Import your swiper

// This is the interface your swiper component expects
interface Restaurant {
  id: string;
  name: string;
  image: string;
  address: string;
}

const createStableId = (item: RestaurantRow) => {
  const combined = item.name + item.address;
  return combined.replace(/[^a-zA-Z0-9]/g, ""); // Removes special chars
};

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

export default function HomeTab() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }

    const unsub = subscribeRestaurants(code, (list: RestaurantRow[]) => {

      const formattedList: Restaurant[] = list.map((item) => ({
        id: createStableId(item),

        name: item.name,
        address: item.address,

        image:
          item.photoUrl ||
          `https://picsum.photos/seed/${encodeURIComponent(item.name)}/1200/800`,
      }));

      setRestaurants(formattedList);
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

  // This function allows for "pull to refresh" logic if we add it later
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
          <Button title="Back to Home" onPress={() => router.replace("/")} />
        </View>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: "#666" }}>
          Finding nearby restaurants…
        </Text>
      </Centered>
    );
  }

  if (error) {
    return (
      <Centered>
        <Text style={{ fontSize: 16, color: "red", textAlign: "center" }}>
          {error}
        </Text>
        <View style={{ marginTop: 20 }}>
           <Button
             title={refreshing ? "Retrying..." : "Try Again"}
             onPress={onRefresh}
             disabled={refreshing}
           />
        </View>
      </Centered>
    );
  }

  // Handle empty state AFTER loading and errors
  // Your SwipeScreenComponent will show its own "all swiped" message
  if (restaurants.length === 0) {
    return (
      <Centered>
        <Text style={{ fontSize: 18, color: "#555", textAlign: "center" }}>
          No restaurants found.
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
    <SwipeScreenComponent
      sessionCode={code}
      restaurants={restaurants}
    />
  );
}