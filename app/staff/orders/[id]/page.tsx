import { JobDetailView } from '../../../../features/staff/components/JobDetailView';

export default async function StaffOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailView orderId={id} />;
}
