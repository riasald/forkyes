// src/assets/restaurantImages.ts

// 1) helper to normalize names to slugs that match your filenames
export function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")  // spaces/punct -> dashes
    .replace(/(^-|-$)/g, "");     // trim dashes
}

/**
 * 2) Static map: slug -> require(image).
 *    You MUST explicitly list images (Metro needs static requires).
 *    Add entries for all images you have.
 */
const images: Record<string, any> = {
  "chipotle": require("./images/Chipotle.jpg"),
  "tuptim-thai-and-sushi": require("./images/Tuptim Thai and Sushi.jpeg"),
  "chick-fil-a": require("./images/Chick-fil-A.jpeg"),
  "just-salad": require("./images/Just Salad.jpeg"),
  "krispe-kreme": require("./images/Krispy Kreme.jpg"),
  "firehouse-subs": require("./images/Firehouse.jpg"),
  "relish": require("./images/Relish.jpg"),
  "poke-bowl-station": require("./images/Poke.jpeg"),
  "subway": require("./images/Subway.jpeg"),
  "the-fresh-food-company": require("./images/The Fresh Food Company.jpg"),
  "piesanos": require("./images/Piesanos.jpg"),
  "pizza-by-the-slice": require("./images/Pizza By The Slice.jpeg"),
  "tatu-sushi-bar-and-grill": require("./images/Tatu.jpg"),
  "midtown-pizza": require("./images/Midtown.jpeg"),
  //"the-spot": require("./images/The Spot.jpg"),
  "dunkin": require("./images/Dunkin.jpg"),
  "bagels-and-noodles": require("./images/Bagels & Noodles.jpeg"),
  "wild-blue-sushi": require("./images/Wild.jpeg"),
     "jimmy-john-s": require("./images/Jimmy.jpg"),     // from "Jimmy John's"
  "pita-pit": require("./images/Pita.jpg"),























  // add more here...
};

export function getRestaurantImageByName(name: string) {
  const slug = toSlug(name);
  return images[slug]; // undefined if not found
}
