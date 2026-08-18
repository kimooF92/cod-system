import { getProducts } from "@/actions/products";
import { ProductTable } from "@/components/products/product-table";

export const metadata = {
  title: "Products & Unit Economics — COD Growth OS",
};

export default async function ProductsPage() {
  const initialProducts = await getProducts("ALL");

  return <ProductTable initialProducts={initialProducts} />;
}
