// In mobile/src/context/SessionContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// Import all your types and functions from your existing "toolbox"
import {
  subscribeRestaurants,
  type RestaurantRow,
  createStableId
} from '../utils/session'; // Adjust path if needed
import { subscribeMatches } from '../utils/matchLogic'; // Adjust path if needed

// 1. Define the full Restaurant type (you can move this to a types file)
interface Restaurant {
  id: string;
  name: string;
  image: string;
  address: string;
}

// 2. Update the Context Type to provide all the data
type SessionContextType = {
  sessionId: string | null;
  setSession: (id: string | null) => void;
  restaurants: Restaurant[]; // The list for swiping
  matchedRestaurants: Restaurant[]; // The final filtered list
  isLoading: boolean;
};

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Create the Provider component (the "hub")
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null); // e.g., "ABCD"
  const [isLoading, setIsLoading] = useState(true);

  // Internal state for processing data
  const [rawRestaurants, setRawRestaurants] = useState<Restaurant[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  
  // 3. Final lists to provide to the app
  const [matchedRestaurants, setMatchedRestaurants] = useState<Restaurant[]>([]);

  // Function to let other screens set the session
  const setSession = (id: string | null) => {
    setSessionId(id);
    // You can add AsyncStorage logic here to save the session
  };

  // 4. EFFECT: Fetch Restaurants when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setRawRestaurants([]);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeRestaurants(sessionId, (list: RestaurantRow[]) => {
      // Format the list ONCE and ONLY here
      const formattedList: Restaurant[] = list.map((item) => ({
        id: createStableId(item), // <-- Use the shared function
        name: item.name,
        address: item.address,
        image: item.photoUrl || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/1200/800`,
      }));
      setRawRestaurants(formattedList);
      setIsLoading(false);
    });

    return unsubscribe; // Clean up listener
  }, [sessionId]);

  // 5. EFFECT: Fetch Matched IDs when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMatchedIds([]);
      return;
    }
    const unsubscribe = subscribeMatches(sessionId, (ids) => {
      setMatchedIds(ids);
    });
    return unsubscribe; // Clean up listener
  }, [sessionId]);
  
  // 6. EFFECT: Filter for matches when either list changes
  useEffect(() => {
    if (rawRestaurants.length === 0 || matchedIds.length === 0) {
      setMatchedRestaurants([]);
      return;
    }
    const matched = rawRestaurants.filter((r) => matchedIds.includes(r.id));
    setMatchedRestaurants(matched);

  }, [rawRestaurants, matchedIds]);


  return (
    <SessionContext.Provider value={{
      sessionId,
      setSession,
      restaurants: rawRestaurants, // Provide the full list
      matchedRestaurants: matchedRestaurants, // Provide the filtered list
      isLoading
    }}>
      {children}
    </SessionContext.Provider>
  );
};

// Create the custom hook to easily use the data
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};