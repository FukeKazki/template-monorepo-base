import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductListItem } from "../../read-model/product-list";

export const columns: ColumnDef<ProductListItem>[] = [
  {
    accessorKey: "imageUrl",
    header: "画像",
    cell: ({ row }) => (
      <img
        src={row.original.imageUrl}
        alt={row.original.name}
        className="size-10 rounded-lg object-cover"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "商品名",
  },
  {
    accessorKey: "formattedPrice",
    header: "価格",
  },
  {
    id: "actions",
    header: "詳細",
    cell: ({ row }) => (
      <Link
        to="/products/$productId"
        params={{ productId: row.original.id }}
        className="text-primary underline-offset-4 hover:underline"
      >
        詳細を見る
      </Link>
    ),
  },
];
