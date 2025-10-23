import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAnonymousAuth } from "../src/utils/authHelpers";
import { createSession } from "../src/utils/session";
import { router } from "expo-router";

export default function CreateSessionScreen() {
  const { ready } = useAnonymousAuth();
  const [name, setName] = useState("");

  const onCreate = async () => {
    try {
      if (!ready) return;
      const code = await createSession(name);
      router.replace({ pathname: "/sessionLobby", params: { code } });
    } catch (e: any) {
      Alert.alert("Create failed", e.message ?? String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Session</Text>

      <TextInput
        placeholder="Your name (optional)"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <View style={styles.buttonBox}>
        <TouchableOpacity style={[styles.button, styles.createButton]} onPress={onCreate}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "80%",
    marginVertical: 6,
  },
  createButton: {
    backgroundColor: "#4CAF50", // green color for Create button
  },
  backButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});
