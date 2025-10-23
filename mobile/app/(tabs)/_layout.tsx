import { Tabs, router } from "expo-router";
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from "react-native";

// This component is fine
function ExitButton() {
  return (
    <TouchableOpacity
      style={styles.exitButton}
      onPress={() => router.replace("/")}
    >
      <Text style={styles.exitButtonText}>Exit Session</Text>
    </TouchableOpacity>
  );
}

// This component is fine
function HeaderLogo() {
  return (
    <Image
      source={require("../../assets/ForkYes_logo.png")}
      style={styles.logo}
      resizeMode="contain"
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <HeaderLogo />,
        headerRight: () => <ExitButton />,
      }}
    >
      <Tabs.Screen
        name="swipe"
        options={{
          title: "Swipe",
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  exitButton: {
    marginRight: 16,
    paddingHorizontal: 0,
    paddingVertical: 5,
  },
  exitButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
  logo: {
    width: 120,
    height: 80,
  },
});