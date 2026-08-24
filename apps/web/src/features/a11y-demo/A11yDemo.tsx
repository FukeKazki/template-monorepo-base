type A11yDemoProps = {
  accessible?: boolean;
};

const LOGO_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%234f46e5'/%3E%3C/svg%3E";

export function A11yDemo({ accessible = true }: A11yDemoProps) {
  if (accessible) {
    return (
      <form>
        <label htmlFor="email">メールアドレス</label>
        <input id="email" type="email" />
        <img src={LOGO_SRC} alt="サービスロゴ" width={32} height={32} />
        <button type="submit">送信</button>
      </form>
    );
  }

  return (
    <form>
      <input type="email" placeholder="メールアドレス" />
      <img src={LOGO_SRC} width={32} height={32} />
      <button type="submit" style={{ color: "#999999", backgroundColor: "#ffffff" }}>
        送信
      </button>
    </form>
  );
}
