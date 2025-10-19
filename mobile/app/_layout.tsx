import { useEffect } from "react";
import { Stack, router, useNavigationContainerRef } from "expo-router";

export default function RootLayout() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    // Wait until navigation is ready before redirecting
    const timeout = setTimeout(() => {
      if (navigationRef.isReady()) {
        router.replace("/(tabs)");
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [navigationRef]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
