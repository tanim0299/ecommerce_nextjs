import TrackOrderClient from './TrackOrderClient';

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order_no?: string | string[] }>;
}) {
  const { order_no: orderNoValue } = await searchParams;
  const initialOrderNo = (Array.isArray(orderNoValue) ? orderNoValue[0] : orderNoValue)?.trim() || '';

  return <TrackOrderClient initialOrderNo={initialOrderNo} />;
}
