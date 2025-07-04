// app/layout.tsx
export const metadata = {
  title: 'My App',
  description: 'Blank Next.js Starter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
