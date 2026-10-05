"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  price: number;
  currency: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function formatPrice(item: Item) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: item.currency.toUpperCase(),
  }).format(item.price / 100);
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch(`${apiUrl}/items`);
        if (!response.ok) {
          throw new Error();
        }
        setItems(await response.json());
      } catch {
        setError("Could not load items. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  async function buy(itemId: string) {
    setPendingId(itemId);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: 1 }),
      });
      if (!response.ok) {
        throw new Error();
      }
      const { url } = await response.json();
      window.location.assign(url);
    } catch {
      setError("Could not start checkout. Please try again.");
      setPendingId("");
    }
  }

  return (
    <>
      <h1>Stripe Checkout Demo</h1>

      {loading && <p>Loading items...</p>}
      {error && <p className="error">{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>
              {item.name} <span className="price">{formatPrice(item)}</span>
            </span>
            <button
              type="button"
              onClick={() => buy(item.id)}
              disabled={pendingId !== ""}
            >
              {pendingId === item.id ? "Redirecting..." : "Buy"}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
