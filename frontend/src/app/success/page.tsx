import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: PageProps<"/success">) {
  const { session_id: sessionId } = await searchParams;

  return (
    <>
      <h1>Thank you for your order</h1>

      <p>
        Checkout session:{" "}
        <code>{typeof sessionId === "string" ? sessionId : "not provided"}</code>
      </p>

      <p className="note">
        This page only means Stripe redirected you back here. It is not proof of
        payment. The real confirmation is the checkout.session.completed webhook
        the backend receives from Stripe.
      </p>

      <p>
        <Link href="/">Back to items</Link>
      </p>
    </>
  );
}
