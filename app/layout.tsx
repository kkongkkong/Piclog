import type { Metadata, Viewport } from 'next';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'Piclog - 무노력 자동 기록 서비스',
  description: '사진만 찍어도 하루 기록이 자동으로 완성되는 타임라인 서비스',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">📸 Piclog</h1>
              <div className="text-sm text-gray-600">
                무노력 자동 기록 서비스
              </div>
            </nav>
          </header>

          <main className="flex-1 py-8">
            {children}
          </main>

          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
              <p>© 2024 Piclog. Made with ❤️</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
