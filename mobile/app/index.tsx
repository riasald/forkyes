import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <Image
        source={require("../assets/ForkYes_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Choose an option:</Text>

      <TouchableOpacity
        style={[styles.button, styles.create]}
        onPress={() => router.push("/createSession")}
      >
        <Text style={styles.buttonText}>Start a Session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.join]}
        onPress={() => router.push("/joinSession")}
      >
        <Text style={styles.buttonText}>Join a Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
 logo: {
  width: 380,   // was 220
  height: 200,  // was 120
  marginBottom: 30,
},

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  create: {
    backgroundColor: "#4CAF50",
  },
  join: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
