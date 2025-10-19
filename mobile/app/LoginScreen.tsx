import React from "react";
import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const handleLogin = () => {
    // For now, just go to tabs after "login"
    router.replace("/(tabs)");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Login Screen</Text>
      <Button title="Continue to App" onPress={handleLogin} />
    </View>
  );
}
