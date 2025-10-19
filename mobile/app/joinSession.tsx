import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";

export default function JoinSessionScreen() {
  const [sessionCode, setSessionCode] = useState("");
  const [name, setName] = useState("");

  const handleJoin = () => {
    if (!sessionCode || !name) {
      Alert.alert("Missing info", "Please enter both name and session code.");
      return;
    }

    // In the future, you can validate with Firebase here
    console.log("Joining session:", sessionCode, "as", name);
    router.replace("/(tabs)"); // Navigate to main app after joining
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Session</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter session code"
        value={sessionCode}
        onChangeText={setSessionCode}
        autoCapitalize="characters"
      />

      <Button title="Join Session" onPress={handleJoin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
});
