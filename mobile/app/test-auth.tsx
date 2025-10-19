// app/test-auth.tsx
import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { signInAnon } from "../src/services/auth"; // <-- adjust path if your src is elsewhere

export default function TestAuthScreen() {
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      const userId = await signInAnon();
      setUid(userId ?? null);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anonymous Auth Test</Text>
      <Button title="Sign in Anonymously" onPress={handleSignIn} />
      {uid && <Text style={styles.text}>✅ UID: {uid}</Text>}
      {error && <Text style={[styles.text, { color: "red" }]}>⚠️ {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, marginBottom: 16 },
  text: { marginTop: 16, fontSize: 14 },
});
