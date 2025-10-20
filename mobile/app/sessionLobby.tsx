import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { subscribeParticipants } from "../src/utils/session";

export default function SessionLobbyScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [people, setPeople] = useState<{ uid: string; name: string }[]>([]);

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeParticipants(String(code), (list) => setPeople(list));
    return unsub;
  }, [code]);

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Session Code</Text>
      <Text style={{ fontSize: 32, letterSpacing: 4 }}>{code}</Text>

      <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "600" }}>Participants</Text>
      <FlatList
        data={people}
        keyExtractor={(x) => x.uid}
        renderItem={({ item }) => <Text style={{ fontSize: 16 }}>• {item.name}</Text>}
        ListEmptyComponent={<Text>Waiting for friends to join…</Text>}
      />

      <Button title="Start swiping (placeholder)" onPress={() => router.replace("/(tabs)")} />
      <Button title="Back" onPress={() => router.push('/')} />
    </View>
  );
}
