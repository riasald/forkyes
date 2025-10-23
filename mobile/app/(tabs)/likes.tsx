import React from "react";
import { View, Text } from "react-native";

export default function LikeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22 }}>No Matches At the Moment!</Text>
    </View>
  );
}
