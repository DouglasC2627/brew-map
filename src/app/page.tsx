import { MapView } from "@/components/map/MapView";
import { getBeans, getBrewingMethods } from "@/lib/data";

export default function Home() {
  const beans = getBeans();
  const methods = getBrewingMethods();
  return <MapView beans={beans} methods={methods} />;
}
