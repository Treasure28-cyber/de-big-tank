import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'De Big Tank',
  description: 'Restaurant, Bakery & Lounge',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
