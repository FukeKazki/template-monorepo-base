import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { useCreateProduct } from "../../mutation/use-create-product";
import { ProductRegisterFormSchema, type ProductRegisterFormValues } from "./schema";

export const ProductRegisterForm = () => {
  const { createProduct, isCreatingProduct, error } = useCreateProduct();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductRegisterFormValues>({
    resolver: valibotResolver(ProductRegisterFormSchema),
    defaultValues: { name: "", price: 0, imageUrl: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createProduct(values);
      reset();
    } catch {
      // 送信エラーは useCreateProduct が返す error で表示するため、ここでは握りつぶす
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-register-name">商品名</Label>
        <Input id="product-register-name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-register-price">価格</Label>
        <Input
          id="product-register-price"
          type="number"
          aria-invalid={!!errors.price}
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-register-image-url">画像URL</Label>
        <Input
          id="product-register-image-url"
          aria-invalid={!!errors.imageUrl}
          {...register("imageUrl")}
        />
        {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
      </div>

      {error && (
        <div role="alert" className="flex flex-col items-start gap-1">
          <p className="text-destructive">商品の登録に失敗しました。</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      )}

      <Button type="submit" disabled={isCreatingProduct} className="self-start">
        {isCreatingProduct ? "登録中..." : "登録する"}
      </Button>
    </form>
  );
};
