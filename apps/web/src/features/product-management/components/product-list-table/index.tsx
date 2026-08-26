import { DataTable } from "@/ui/data-table";
import { useProductList } from "../../query/use-product-list";
import { columns } from "./columns";

export const ProductListTable = () => {
  const productList = useProductList();

  return <DataTable columns={columns} data={productList} />;
};
