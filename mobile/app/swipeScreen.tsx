
// Mock data or fetch logic
const MOCK_RESTAURANTS = [
    { id: '1', name: 'Restaurant A', image: 'http://googleusercontent.com/images.google.com/0', address: '123 Main St' },
    { id: '2', name: 'Restaurant B', image: 'http://googleusercontent.com/images.google.com/0', address: '456 Side St' },
    // ... more restaurants
];


export default function SwipeScreenRoute() {
  const { sessionCode } = useLocalSearchParams<{ sessionCode: string }>();
  const restaurants = MOCK_RESTAURANTS;

  if (!sessionCode) {
    // Now <Text> component is recognized
    return <Text>Error: Session code is missing.</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: `Swiping (${sessionCode})` }} />
      <SwipeScreenComponent
         sessionCode={sessionCode}
         restaurants={restaurants}
       />
    </>
  );
}