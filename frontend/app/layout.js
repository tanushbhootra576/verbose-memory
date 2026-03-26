import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { Toaster } from 'react-hot-toast';
import ThemeScript from '../components/ThemeScript';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'HealthIoT — Real-Time Healthcare Monitoring',
  description: 'Advanced IoT-powered real-time patient monitoring, ambulance tracking, and emergency management platform.',
  keywords: 'healthcare, IoT, ambulance tracking, patient monitoring, ESP32, real-time',
  openGraph: {
    title: 'HealthIoT Dashboard',
    description: 'Real-time Healthcare IoT Monitoring System',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeScript />
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--card)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                error:   { duration: 6000 },
                success: { duration: 3000 },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
