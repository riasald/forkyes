import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { subscribeParticipants } from "../src/utils/session";

export default function SessionLobbyScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [people, setPeople] = useState<{ uid: string; name: string }[]>([]);

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeParticipants(String(code), (list) => setPeople(list));
    return unsub;
  }, [code]);

  const handleStartSwiping = () => {
    if (!code) {
      console.warn("⚠️ No session code to pass!");
      return;
    }
    console.log("➡️ Navigating to index with code:", code);
    router.replace({
      pathname: "/swipe",
      params: { code: String(code) },
    });
  };

  const renderParticipant = ({ item }: { item: { uid: string; name: string } }) => (
    <View style={styles.participantCard}>
      <Text style={styles.participantEmoji}>👤</Text>
      <Text style={styles.participantName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.header}>Session Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{code}</Text>
          </View>

          <Text style={styles.participantHeader}>Participants</Text>
          <FlatList
            data={people}
            keyExtractor={(x) => x.uid}
            renderItem={renderParticipant}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>Waiting for friends to join…</Text>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>

        <View>
          <TouchableOpacity style={styles.startButton} onPress={handleStartSwiping}>
            <Text style={styles.startButtonText}>Start Swiping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f5", // Light gray background
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between", // Pushes button to bottom
  },
  content: {
    flex: 1, // Takes up available space
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  codeContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    alignItems: "center",
  },
  codeText: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: 6,
    color: "#09090b",
    fontFamily: "monospace",
  },
  participantHeader: {
    marginTop: 32,
    fontSize: 20,
    fontWeight: "600",
    color: "#3f3f46",
    marginBottom: 8,
  },
  listContent: {
    gap: 8,
  },
  participantCard: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  participantEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    color: "#27272a",
  },
  emptyListText: {
    fontSize: 16,
    color: "#71717a",
    textAlign: "center",
    marginTop: 20,
  },
  startButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },

  // 👇 Here are the styles for the new button 👇
  backButton: {
    padding: 10,
    alignItems: "center",
    marginTop: 8, // Adds space between the two buttons
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF", // A more subtle gray color
  },
});