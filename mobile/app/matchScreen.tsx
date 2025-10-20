import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native'; // Import Text for error message

// Adjust the import path
import MatchScreenComponent from '@/src/screens/MatchScreen';
// Or with alias:
// import MatchScreenComponent from '@/screens/MatchScreen';


// Mock data or fetch logic would go here
const MOCK_RESTAURANTS = [
    { id: '1', name: 'Restaurant A', image: 'http://googleusercontent.com/images.google.com/0', address: '123 Main St' },
    { id: '2', name: 'Restaurant B', image: 'http://googleusercontent.com/images.google.com/0', address: '456 Side St' },
    // ... more restaurants including the potential match
];


export default function MatchScreenRoute() {
  const { sessionCode } = useLocalSearchParams<{ sessionCode: string }>();

  // Fetch or pass the same list of restaurants relevant to this session
   const restaurants = MOCK_RESTAURANTS; // Replace with actual data logic

   if (!sessionCode) {
     return <Text>Error: Session code is missing.</Text>;
   }

  return (
     <>
      <Stack.Screen options={{ title: 'Match Found!' }} />
      <MatchScreenComponent
        sessionCode={sessionCode}
        restaurants={restaurants}
      />
     </>
  );
}