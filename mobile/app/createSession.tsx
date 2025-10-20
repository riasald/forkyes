import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
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
    <View style={{ flex: 1, padding: 24, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Create a Session</Text>
      <TextInput
        placeholder="Your name (optional)"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 }}
      />
      <Button title="Create" onPress={onCreate} />
      <Button title="Back" onPress={() => router.push('/')} />
    </View>
  );
}
