import { getProductTests } from "@/actions/tests";
import { TestList } from "@/components/testing/test-list";

export const metadata = {
  title: "Product Testing Campaigns — COD Growth OS",
};

export default async function TestingPage() {
  const initialTests = await getProductTests("ALL");

  return <TestList initialTests={initialTests} />;
}
