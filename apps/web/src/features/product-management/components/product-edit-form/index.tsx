import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { useUpdateProduct } from "../../mutation/use-update-product";
import { ProductNotFoundError } from "../../port/fetch-product-detail";
import { useProductDetail } from "../../query/use-product-detail";
import { InvalidProductDetailError } from "../../read-model/product-detail";
import { ProductEditFormSchema, type ProductEditFormValues } from "./schema";
import type { ProductId } from "../../read-model/product-id";

type ProductEditFormProps = {
  productId: ProductId;
};

export const ProductEditForm = ({ productId }: ProductEditFormProps) => {
  const { productDetail, error, isPending, refetchProductDetail } = useProductDetail(productId);
  const { updateProduct, isUpdatingProduct, error: updateError } = useUpdateProduct();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductEditFormValues>({
    resolver: valibotResolver(ProductEditFormSchema),
    defaultValues: { name: "", price: 0, imageUrl: "" },
  });

  const detailId = productDetail?.id;
  const detailName = productDetail?.name;
  const detailPrice = productDetail?.price;
  const detailImageUrl = productDetail?.imageUrl;

  useEffect(() => {
    if (
      detailId === undefined ||
      detailName === undefined ||
      detailPrice === undefined ||
      detailImageUrl === undefined
    ) {
      return;
    }
    reset({ name: detailName, price: detailPrice, imageUrl: detailImageUrl });
  }, [detailId, detailName, detailPrice, detailImageUrl, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProduct({ id: productId, ...values });
      await navigate({ to: "/products/$productId", params: { productId } });
    } catch {
      // 送信エラーは useUpdateProduct が返す error で表示するため、ここでは握りつぶす
    }
  });

  if (isPending) {
    return <p className="text-muted-foreground text-sm">読み込み中...</p>;
  }

  if (error instanceof ProductNotFoundError) {
    return <p className="text-muted-foreground text-sm">商品が見つかりませんでした。</p>;
  }

  if (error instanceof InvalidProductDetailError) {
    return <p className="text-destructive text-sm">商品データの形式が不正なため表示できません。</p>;
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2">
        <p className="text-destructive">商品詳細の取得に失敗しました。</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button variant="outline" onClick={() => refetchProductDetail()}>
          再試行
        </Button>
      </div>
    );
  }

  if (!productDetail) {
    return <p className="text-muted-foreground text-sm">商品が見つかりませんでした。</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Link
        to="/products/$productId"
        params={{ productId }}
        className="text-primary text-sm underline-offset-4 hover:underline"
      >
        ← 商品詳細に戻る
      </Link>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-edit-name">商品名</Label>
        <Input id="product-edit-name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-edit-price">価格</Label>
        <Input
          id="product-edit-price"
          type="number"
          aria-invalid={!!errors.price}
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-edit-image-url">画像URL</Label>
        <Input
          id="product-edit-image-url"
          aria-invalid={!!errors.imageUrl}
          {...register("imageUrl")}
        />
        {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
      </div>

      {updateError && (
        <div role="alert" className="flex flex-col items-start gap-1">
          <p className="text-destructive">商品の更新に失敗しました。</p>
          <p className="text-muted-foreground text-sm">{updateError.message}</p>
        </div>
      )}

      <Button type="submit" disabled={isUpdatingProduct} className="self-start">
        {isUpdatingProduct ? "更新中..." : "更新する"}
      </Button>
    </form>
  );
};
