/**
 * Root Layout
 * Main layout wrapper with theme provider and styled-components
 * Ensures theme persistence across entire application
 */

import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeWrapper } from '@/lib/styled-components-provider';

export const metadata = {
  title: 'App',
  description: 'Secure frontend application with role-based access',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
