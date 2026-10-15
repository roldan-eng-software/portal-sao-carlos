import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { ToastProvider } from '@/components/ui/Toast';

export default function AnuncieLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="conteudo" className="w-full flex-1">
        {children}
      </main>
      <Footer />
      <GoogleAnalytics />
      <ToastProvider />
    </>
  );
}