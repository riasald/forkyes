"use client"

// app/(tabs)/index.tsx
import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { View, Text, ActivityIndicator, Button, Modal, StyleSheet, TouchableOpacity } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import {
  subscribeRestaurants,
  seedRestaurantsForSession,
  subscribeParticipants,
  type RestaurantRow,
} from "../../src/utils/session"
import SwipeScreenComponent from "../../src/screens/SwipeScreen"
import { watchForMatches } from "../../src/utils/matchLogic"

// This is the interface your swiper component expects
interface Restaurant {
  id: string
  name: string
  image: string
  address: string
}

const createStableId = (item: RestaurantRow) => {
  const combined = item.name + item.address
  return combined.replace(/[^a-zA-Z0-9]/g, "") // Removes special chars
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fafafa",
      }}
    >
      {children}
    </View>
  )
}

export default function HomeTab() {
  const { code } = useLocalSearchParams<{ code?: string }>()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)

  useEffect(() => {
    if (!code) {
      setLoading(false)
      return
    }

    const unsub = subscribeRestaurants(code, (list: RestaurantRow[]) => {
      const formattedList: Restaurant[] = list.map((item) => ({
        id: createStableId(item),

        name: item.name,
        address: item.address,

        image: item.photoUrl || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/1200/800`,
      }))

      setRestaurants(formattedList)
      setLoading(false)
    })

    return unsub
  }, [code])

  useEffect(() => {
    if (!code) return

    let unsubscribeMatches: (() => void) | undefined

    // Subscribe to participants first
    const unsubscribeParticipants = subscribeParticipants(code, (participants) => {
      // Once we have participants, start watching for matches
      if (unsubscribeMatches) {
        unsubscribeMatches()
      }

      unsubscribeMatches = watchForMatches(code, participants, (restaurantId) => {
        // Find the matched restaurant
        const matched = restaurants.find((r) => r.id === restaurantId)
        if (matched) {
          setMatchedRestaurant(matched)
          setShowMatchModal(true)
        }
      })
    })

    return () => {
      unsubscribeParticipants()
      if (unsubscribeMatches) {
        unsubscribeMatches()
      }
    }
  }, [code, restaurants])

  useEffect(() => {
    if (!code) return
    ;(async () => {
      try {
        setError(null)
        setLoading(true)
        await seedRestaurantsForSession(code, { radiusMeters: 5000 })
      } catch (e: any) {
        setError(e.message || "Failed to load restaurants")
      } finally {
        setLoading(false)
      }
    })()
  }, [code])

  // This function allows for "pull to refresh" logic if we add it later
  const onRefresh = useCallback(async () => {
    if (!code) return
    try {
      setRefreshing(true)
      await seedRestaurantsForSession(code, { radiusMeters: 5000 })
    } finally {
      setRefreshing(false)
    }
  }, [code])

  if (!code) {
    return (
      <Centered>
        <Text style={{ fontSize: 16, color: "#444", textAlign: "center" }}>Missing session code.</Text>
        <View style={{ marginTop: 20 }}>
          <Button title="Back to Home" onPress={() => router.replace("/")} />
        </View>
      </Centered>
    )
  }

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: "#666" }}>Finding nearby restaurants…</Text>
      </Centered>
    )
  }

  if (error) {
    return (
      <Centered>
        <Text style={{ fontSize: 16, color: "red", textAlign: "center" }}>{error}</Text>
        <View style={{ marginTop: 20 }}>
          <Button title={refreshing ? "Retrying..." : "Try Again"} onPress={onRefresh} disabled={refreshing} />
        </View>
      </Centered>
    )
  }

  // Handle empty state AFTER loading and errors
  // Your SwipeScreenComponent will show its own "all swiped" message
  if (restaurants.length === 0) {
    return (
      <Centered>
        <Text style={{ fontSize: 18, color: "#555", textAlign: "center" }}>No restaurants found.</Text>
        <Text style={{ color: "#888", textAlign: "center", marginVertical: 16 }}>
          Try expanding your search radius or refresh.
        </Text>
        <Button title={refreshing ? "Refreshing..." : "Refresh Now"} onPress={onRefresh} disabled={refreshing} />
      </Centered>
    )
  }

  return (
    <>
      <SwipeScreenComponent sessionCode={code} restaurants={restaurants} />

      <Modal
        visible={showMatchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.emoji}>🎉</Text>
            <Text style={modalStyles.title}>It's a Match!</Text>
            {matchedRestaurant && (
              <>
                <Text style={modalStyles.restaurantName}>{matchedRestaurant.name}</Text>
                <Text style={modalStyles.restaurantAddress}>{matchedRestaurant.address}</Text>
              </>
            )}
            <TouchableOpacity style={modalStyles.button} onPress={() => setShowMatchModal(false)}>
              <Text style={modalStyles.buttonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
    marginBottom: 8,
  },
  restaurantAddress: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})
