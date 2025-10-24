"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Image } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { subscribeRestaurants, type RestaurantRow, createStableId } from "../../src/utils/session"
import { subscribeMatches } from "../../src/utils/matchLogic"
import { getRestaurantImageByName } from "../../assets/restaurantImages"

interface Restaurant {
  id: string
  name: string
  image: string
  address: string
}

export default function MatchScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [matchedRestaurants, setMatchedRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    if (!code) return

    const unsubscribe = subscribeRestaurants(code, (list: RestaurantRow[]) => {
      console.log("[v0] Matches - Raw restaurants received from Firebase:", list.length)
      const formattedList: Restaurant[] = list.map((item) => ({
        id: createStableId(item),
        name: item.name,
        address: item.address,
        image: item.photoUrl || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/1200/800`,
      }))
      console.log("[v0] Matches - Formatted restaurants:", formattedList.length)
      console.log(
        "[v0] Matches - Sample restaurant IDs:",
        formattedList.slice(0, 3).map((r) => r.id),
      )
      setRestaurants(formattedList)
    })

    return unsubscribe
  }, [code])

  useEffect(() => {
    if (!code) return

    const unsubscribe = subscribeMatches(code, (ids) => {
      console.log("[v0] Matches - Raw matched IDs received from Firebase:", ids.length)
      console.log("[v0] Matches - Matched IDs:", ids)
      setMatchedIds(ids)
    })

    return unsubscribe
  }, [code])

  useEffect(() => {
    console.log(
      "[v0] Matches - Filtering: restaurants.length =",
      restaurants.length,
      "matchedIds.length =",
      matchedIds.length,
    )

    if (restaurants.length === 0 || matchedIds.length === 0) {
      console.log("[v0] Matches - Skipping filter: restaurants or matchedIds is empty")
      setMatchedRestaurants([])
      return
    }

    const matched = restaurants.filter((r) => {
      const isMatched = matchedIds.includes(r.id)
      if (isMatched) {
        console.log("[v0] Matches - Found match:", r.name, "with ID:", r.id)
      }
      return isMatched
    })

    console.log("[v0] Matches - Filtered matched restaurants:", matched.length)
    console.log(
      "[v0] Matches - All restaurant IDs:",
      restaurants.map((r) => r.id),
    )
    console.log("[v0] Matches - All matched IDs:", matchedIds)
    setMatchedRestaurants(matched)
  }, [restaurants, matchedIds])

  const openInMaps = (address: string) => {
    const query = encodeURIComponent(address)
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`
    Linking.openURL(url).catch((err) => console.error("Couldn't open maps", err))
  }

  if (matchedRestaurants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🍽️</Text>
        <Text style={styles.emptyTitle}>No Matches Yet!</Text>
        <Text style={styles.emptySubtitle}>Keep swiping to find restaurants everyone agrees on</Text>
        <Text style={styles.debugText}>
          Restaurants loaded: {restaurants.length} | Matches: {matchedIds.length}
        </Text>
      </View>
    )
  }

  // return (
  //   <View style={styles.container}>
  //     <Text style={styles.header}>Your Matches</Text>
  //     <FlatList
  //       data={matchedRestaurants}
  //       keyExtractor={(item) => item.id}
  //       contentContainerStyle={styles.listContent}
  //       renderItem={({ item }) => {
  //         const localImg = getRestaurantImageByName(item.name)
  //         const imageSource = localImg
  //           ? localImg
  //           : item.image
  //             ? { uri: item.image }
  //             : { uri: `https://picsum.photos/seed/${encodeURIComponent(item.name)}/1200/800` }

  //         return (
  //           <TouchableOpacity style={styles.card} onPress={() => openInMaps(item.address)} activeOpacity={0.7}>
  //             <Image source={imageSource} style={styles.image} resizeMode="cover" />
  //             <View style={styles.cardContent}>
  //               <View style={styles.textContainer}>
  //                 <Text style={styles.name}>{item.name}</Text>
  //                 <Text style={styles.address}>{item.address}</Text>
  //               </View>
  //               <View style={styles.iconContainer}>
  //                 <Text style={styles.icon}>📍</Text>
  //               </View>
  //             </View>
  //           </TouchableOpacity>
  //         )
  //       }}
  //     />
  //   </View>
  // )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 15,
    color: "#333",
  },
  listContent: {
    padding: 15,
    paddingTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  iconContainer: {
    marginLeft: 10,
  },
  icon: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fafafa",
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  debugText: {
    fontSize: 12,
    color: "#999",
    marginTop: 20,
    textAlign: "center",
  },
})
