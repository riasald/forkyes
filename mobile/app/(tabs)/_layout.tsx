// 1. Import Stack instead of Tabs
import { Stack, router } from "expo-router"; 
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
    // 2. Change Tabs to Stack
    <Stack
      screenOptions={{
        headerTitle: () => <HeaderLogo />,
        headerRight: () => <ExitButton />,
      }}
    >
      {/* 3. Change Tabs.Screen to Stack.Screen */}
      <Stack.Screen
        name="swipe"
        options={{
          title: "Swipe",
        }}
      />
       
       {/* Your matches.tsx file still exists, 
           but it's no longer a tab. If you want to be
           able to navigate to it (e.g., from a button),
           you can add it back here like this:
           
           <Stack.Screen name="matches" />
       */}
       
    {/* 4. Change closing tag to Stack */}
    </Stack> 
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