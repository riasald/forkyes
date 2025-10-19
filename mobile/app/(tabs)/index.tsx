import { View, Text, Button } from "react-native";
import { router } from "expo-router";
import React from "react";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text style={{ fontSize: 22 }}>Home Tab Screen</Text>
      <Button
        title="Join a Session"
        onPress={() => router.push("/joinSession")}
      />
    </View>
  );
}
