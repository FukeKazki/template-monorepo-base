import { Link } from "@tanstack/react-router";
import { Button } from "@/ui/button";
import { ProductNotFoundError, useProductDetail } from "../../query/use-product-detail";

type ProductDetailProps = {
  productId: string;
};

export const ProductDetail = ({ productId }: ProductDetailProps) => {
  const { productDetail, error, isPending, refetchProductDetail } = useProductDetail(productId);

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">読み込み中...</p>;
  }

  if (error instanceof ProductNotFoundError) {
    return <p className="text-muted-foreground p-4 text-sm">商品が見つかりませんでした。</p>;
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 p-4">
        <p className="text-destructive">商品詳細の取得に失敗しました。</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button variant="outline" onClick={() => refetchProductDetail()}>
          再試行
        </Button>
      </div>
    );
  }

  if (!productDetail) {
    return <p className="text-muted-foreground p-4 text-sm">商品が見つかりませんでした。</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Link to="/" className="text-primary text-sm underline-offset-4 hover:underline">
        ← 商品一覧に戻る
      </Link>

      <img
        src={productDetail.imageUrl}
        alt={productDetail.name}
        className="size-48 rounded-md object-cover"
      />

      <h1 className="text-2xl font-bold">{productDetail.name}</h1>
      <p className="text-muted-foreground text-lg">{productDetail.formattedPrice}</p>

      <Button
        variant="outline"
        className="self-start"
        nativeButton={false}
        render={<Link to="/products/$productId/edit" params={{ productId }} />}
      >
        編集する
      </Button>
    </div>
  );
};
