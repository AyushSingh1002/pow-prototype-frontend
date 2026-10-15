import type { Metadata, Viewport } from 'next';
import { Archivo, Newsreader, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
  axes: ['wdth'],
});

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  axes: ['opsz'],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-noto-sans-devanagari',
  weight: ['400', '500', '600'],
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-noto-serif-devanagari',
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'Press & Proof (Demo) — Print anything, see the price first',
  description:
    'Concept prototype for an Indian online printing store. Configure, proof and estimate your print job with illustrative sample prices.',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#E8EAEE',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${newsreader.variable} ${notoSansDevanagari.variable} ${notoSerifDevanagari.variable}`}
    >
      <body className="proof-table-body antialiased">{children}</body>
    </html>
  );
}

