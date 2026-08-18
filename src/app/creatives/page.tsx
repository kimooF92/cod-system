import { getMarketingAngles } from "@/actions/creatives";
import { getCreativeAssets } from "@/actions/creative-assets";
import { getCampaignHierarchy } from "@/actions/campaigns";
import { CreativeHub } from "@/components/creatives/creative-hub";

export const metadata = {
  title: "Marketing Creatives & Campaign Structure — COD Growth OS",
};

export default async function CreativesPage() {
  const [initialAngles, initialAssets, initialCampaigns] = await Promise.all([
    getMarketingAngles("ALL"),
    getCreativeAssets(),
    getCampaignHierarchy(),
  ]);

  return (
    <CreativeHub
      initialAngles={initialAngles}
      initialAssets={initialAssets}
      initialCampaigns={initialCampaigns}
    />
  );
}
