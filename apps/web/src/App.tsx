import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1 className="text-3xl font-bold text-blue-600">Vite + React</h1>
      <button
        type="button"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        onClick={() => setCount((c) => c + 1)}
      >
        count is {count}
      </button>
    </main>
  );
}
