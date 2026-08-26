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
        className="size-10 rounded-md object-cover"
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
];
