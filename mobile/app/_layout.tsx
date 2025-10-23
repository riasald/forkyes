import { Stack } from "expo-router"
import { useAnonymousAuth } from "../src/utils/authHelpers"
import { View, ActivityIndicator, Text } from "react-native"

export default function RootLayout() {
  const { user, ready } = useAnonymousAuth()

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 16, color: "#666" }}>Initializing...</Text>
      </View>
    )
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
