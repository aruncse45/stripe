export type Item = {
  id: string;
  name: string;
  price: number;
  currency: string;
};

export const items: Item[] = [
  { id: 'mug', name: 'Ceramic Mug', price: 1200, currency: 'usd' },
  { id: 'tshirt', name: 'Cotton T-Shirt', price: 2500, currency: 'usd' },
  { id: 'hoodie', name: 'Zip Hoodie', price: 5900, currency: 'usd' },
];

export function findItem(id: string): Item | undefined {
  return items.find((item) => item.id === id);
}
