import React from "react";
import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function HomeTab() {
  return (
    <View style={{ flex: 1, gap: 16, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>ForkYes</Text>
      <Button title="Create a Session" onPress={() => router.push("/createSession")} />
      <Button title="Join a Session" onPress={() => router.push("/joinSession")} />
    </View>
  );
}
