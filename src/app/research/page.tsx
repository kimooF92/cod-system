import { getResearchItems } from "@/actions/research";
import { ResearchList } from "@/components/research/research-list";

export const metadata = {
  title: "Product Research & Backlog — COD Growth OS",
};

export default async function ResearchPage() {
  const initialItems = await getResearchItems("ALL");

  return <ResearchList initialItems={initialItems} />;
}
