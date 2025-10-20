// app/index.tsx (or app/(tabs)/index.tsx)
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { subscribeRestaurants, seedRestaurantsForSession } from "../../src/utils/session";

type Row = { name: string; address: string; photoUrl?: string };

export default function HomeTab() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeRestaurants(code, (list: Row[]) => {
      setRows(list);
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
          Missing session code. Fart here with {"{ code }"} after createSession().
        </Text>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#666" }}>Finding nearby restaurants…</Text>
      </Centered>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {error ? (
        <Text style={{ color: "red", padding: 12, textAlign: "center" }}>{error}</Text>
      ) : null}

      <FlatList
        data={rows}
        keyExtractor={(item, i) => (item.name ?? "row") + i}
        numColumns={1}
        contentContainerStyle={{ padding: 16, gap: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => <RestaurantCard item={item} />}
        ListEmptyComponent={
          <Centered>
            <Text style={{ color: "#666" }}>No restaurants found in this area.</Text>
          </Centered>
        }
      />
    </View>
  );
}

function RestaurantCard({
  item,
  onPress,
}: {
  item: Row;
  onPress?: () => void;
}) {
  const src = item.photoUrl
    ? { uri: item.photoUrl }
    : { uri: `https://picsum.photos/seed/${encodeURIComponent(item.name)}/1200/800` };

const { width, height } = Dimensions.get("window");
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: width - 32,
        height: height / 3,
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <Image source={src} resizeMode="cover" style={{ width: "100%", height: "70%" }} />
      <View style={{ padding: 10 }}>
        <Text numberOfLines={1} style={{ fontWeight: "700", fontSize: 16, color: "#222" }}>
          {item.name}
        </Text>
        <Text numberOfLines={2} style={{ color: "#666", marginTop: 2 }}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      {children}
    </View>
  );
<Button title="Back" onPress={() => router.push('/')} />
}
