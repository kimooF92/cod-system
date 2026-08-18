import { getAdPerformanceRecords } from "@/actions/ad-performance";
import { AdPerformanceTable } from "@/components/analytics/ad-performance-table";

export const metadata = {
  title: "Ad Spend Analytics & Meta Performance — COD Growth OS",
};

export default async function AnalyticsPage() {
  const initialRecords = await getAdPerformanceRecords();

  return <AdPerformanceTable initialRecords={initialRecords} />;
}
