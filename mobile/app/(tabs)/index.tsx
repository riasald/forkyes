// app/index.tsx (or app/(tabs)/index.tsx)
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { subscribeRestaurants, seedRestaurantsForSession } from "../../src/utils/session"; 
type Row = { name: string; address: string };

export default function HomeTab() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // subscribe to the restaurants list for this session
  useEffect(() => {
    if (!code) return;
    const unsub = subscribeRestaurants(code, (list) => {
      setRows(list);
      setLoading(false);
    });
    return unsub;
  }, [code]);

  // seed the list once when we land here (uses session.location, limit=30)
  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        await seedRestaurantsForSession(code, { radiusMeters: 5000 }); // tweak radius if you like
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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {error ? (
        <Text style={{ color: "red", padding: 12, textAlign: "center" }}>{error}</Text>
      ) : null}

      <FlatList
        data={rows}
        keyExtractor={(item, i) => item.name + i}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10 }}>
            <Text style={{ fontWeight: "700", fontSize: 16, color: "#222" }}>{item.name}</Text>
            <Text style={{ color: "#666" }}>{item.address}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Centered>
            <Text style={{ color: "#666" }}>No restaurants found in this area.</Text>
          </Centered>
        }
      />
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      {children}
    </View>
  );
}
