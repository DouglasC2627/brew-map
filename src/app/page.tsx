import { MapView } from "@/components/map/MapView";
import { getBeans, getBrewingMethods, getFlavorNotes } from "@/lib/data";

export default function Home() {
  const beans = getBeans();
  const methods = getBrewingMethods();
  const flavorNotes = getFlavorNotes();
  return <MapView beans={beans} methods={methods} flavorNotes={flavorNotes} />;
}
