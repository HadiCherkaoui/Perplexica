import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import SessionProviderClient from '@/app/providers/SessionProviderClient';
import { Montserrat } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/theme/Provider';
import { cn } from '@/lib/utils';
import './globals.css';

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata = {
  title: 'Perplexica - Chat with the internet',
  description:
    'Perplexica is an AI powered chatbot that is connected to the internet.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className={cn('h-full', montserrat.className)}>
        <ThemeProvider>
          <SessionProviderClient session={session}>
            <Sidebar>{children}</Sidebar>
            <Toaster
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast:
                    'bg-light-primary dark:bg-dark-secondary dark:text-white/70 text-black-70 rounded-lg p-4 flex flex-row items-center space-x-2',
                },
              }}
            />
          </SessionProviderClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
