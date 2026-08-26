import { useProductList } from "../../query/use-product-list";

export const ProductListTable = () => {
  const productList = useProductList();

  return (
    <ul>
      {productList.map((product) => (
        <li key={product.name}>
          <div>{product.name}</div>
          <div>{product.formattedPrice}</div>
          <div>{product.imageUrl}</div>
        </li>
      ))}
    </ul>
  );
};
