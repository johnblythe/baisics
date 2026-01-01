import MainLayout from '@/app/components/layouts/MainLayout';

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
