import { Button } from "@/ui/button";
import { DataTable } from "@/ui/data-table";
import { useProductList } from "../../query/use-product-list";
import { columns } from "./columns";

export const ProductListTable = () => {
  const { productList, error, isPending, refetchProductList } = useProductList();

  if (isPending) {
    return <p className="text-muted-foreground text-sm">読み込み中...</p>;
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2">
        <p className="text-destructive">商品一覧の取得に失敗しました。</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button variant="outline" onClick={() => refetchProductList()}>
          再試行
        </Button>
      </div>
    );
  }

  return <DataTable columns={columns} data={productList} />;
};
