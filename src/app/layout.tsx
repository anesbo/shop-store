// src/app/layout.tsx

export const metadata = {
  title: 'Shoppica Admin Dashboard',
  description: 'Admin interface for Shoppica e-commerce platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
