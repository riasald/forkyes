import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useAnonymousAuth } from "../src/utils/authHelpers";
import { joinSession } from "../src/utils/session";
import { router } from "expo-router";

export default function JoinSessionScreen() {
  const { ready } = useAnonymousAuth();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const onJoin = async () => {
    try {
      if (!ready) return;
      const normalized = await joinSession(code, name);
      router.replace({ pathname: "/sessionLobby", params: { code: normalized } });
    } catch (e: any) {
      Alert.alert("Join failed", e.message ?? String(e));
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Join a Session</Text>
      <TextInput
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 }}
      />
      <TextInput
        placeholder="Session code (e.g. ABC123)"
        value={code}
        autoCapitalize="characters"
        onChangeText={setCode}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 }}
      />
      <Button title="Join" onPress={onJoin} />
    </View>
  );
}
