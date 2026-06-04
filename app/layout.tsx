import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({
  variable: '--font-vazirmatn',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'فیتار | برنامه تمرینی و تغذیه با هوش مصنوعی',
  description:
    'برنامه تمرینی شخصی‌سازی‌شده، آنالیز بدنی، رژیم غذایی ایرانی و کالری‌شماری — با هوش مصنوعی',
  keywords: ['فیتنس', 'بدنسازی', 'رژیم', 'تغذیه', 'هوش مصنوعی', 'فیتار'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
