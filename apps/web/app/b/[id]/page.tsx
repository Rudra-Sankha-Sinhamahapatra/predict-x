import ClientBiddingPage from "./client-page";

export default async function BiddingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientBiddingPage id={id} />;
}


