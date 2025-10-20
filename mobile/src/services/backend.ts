// src/services/backend.ts

const GEOAPIFY_KEY = "fb8e9467fbc74098ae888a959a189c42";

export async function fetchRestaurantsByRadius(
  lat: number,
  lon: number,
  radiusMeters: number = 5000,
  limit: number = 30
) {
  try {
    const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.fast_food&filter=circle:${lon},${lat},${radiusMeters}&bias=proximity:${lon},${lat}&limit=${limit}&apiKey=${GEOAPIFY_KEY}`;

    console.log("➡️ Fetching from Geoapify:", url);

    const res = await fetch(url);
    const data = await res.json();

    console.log("📦 Geoapify returned:", data);

    const restaurants =
      (data.features || []).map((f: any) => ({
        name: f.properties?.name || "Unnamed place",
        address: f.properties?.formatted || "",
      })) ?? [];

    console.log("✅ Parsed restaurants:", restaurants.length);
    return restaurants;
  } catch (err) {
    console.error("❌ Error fetching Geoapify data:", err);
    return [];
  }
}
