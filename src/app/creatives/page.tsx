import { getMarketingAngles } from "@/actions/creatives";
import { AngleRegistry } from "@/components/creatives/angle-registry";

export const metadata = {
  title: "Marketing Angles & Hooks — COD Growth OS",
};

export default async function CreativesPage() {
  const initialAngles = await getMarketingAngles("ALL");

  return <AngleRegistry initialAngles={initialAngles} />;
}
