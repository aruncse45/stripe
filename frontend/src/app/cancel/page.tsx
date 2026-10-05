import Link from "next/link";

export default function CancelPage() {
  return (
    <>
      <h1>Payment cancelled</h1>

      <p>You left Stripe Checkout before paying. Nothing was charged.</p>

      <p>
        <Link href="/">Back to items</Link>
      </p>
    </>
  );
}
