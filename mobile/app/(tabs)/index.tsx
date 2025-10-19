import React from "react";
import { View, Text } from "react-native";

export default function HomeTab() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>
        FOOD OPTIONS GO HERE
      </Text>
    </View>
  );
}
