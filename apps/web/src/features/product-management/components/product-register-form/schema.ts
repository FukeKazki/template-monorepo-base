import * as v from "valibot";

export const ProductRegisterFormSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("商品名を入力してください")),
  price: v.pipe(v.number("価格を入力してください"), v.minValue(0, "価格は0以上で入力してください")),
  imageUrl: v.pipe(
    v.string(),
    v.nonEmpty("画像URLを入力してください"),
    v.url("有効なURLを入力してください"),
  ),
});

export type ProductRegisterFormValues = v.InferInput<typeof ProductRegisterFormSchema>;
