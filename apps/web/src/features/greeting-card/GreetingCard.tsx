type GreetingCardProps = {
  name: string;
  message?: string;
};

export function GreetingCard({ name, message = "ようこそ！" }: GreetingCardProps) {
  return (
    <section>
      <h2 className="text-amber-400">こんにちは、{name} さん</h2>
      <p>{message}</p>
    </section>
  );
}
