
'use client';

import TranslationUI from '@/components/translation-ui';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function TranslatorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth state is not loading and there is no user, redirect to login.
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // While loading or if there's no user, show a loading spinner.
  // This prevents the UI from flashing before the redirect happens.
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Only render the TranslationUI if the user is authenticated.
  return (
    <>
    <Header />
    <main className="flex-grow">
    <div className="container mx-auto px-4 py-8">
      <TranslationUI />
    </div>
    </main>
    <Footer />
    </>
  );
}
