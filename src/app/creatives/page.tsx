import { getMarketingAngles } from "@/actions/creatives";
import { getCreativeAssets } from "@/actions/creative-assets";
import { CreativeHub } from "@/components/creatives/creative-hub";

export const metadata = {
  title: "Marketing Creatives & Asset Library — COD Growth OS",
};

export default async function CreativesPage() {
  const [initialAngles, initialAssets] = await Promise.all([
    getMarketingAngles("ALL"),
    getCreativeAssets(),
  ]);

  return <CreativeHub initialAngles={initialAngles} initialAssets={initialAssets} />;
}
