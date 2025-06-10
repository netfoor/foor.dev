
import './globals.css';
import './theme-colors.css';
import '@aws-amplify/ui-react/styles.css';
import { AmplifyWrapper } from '@/app/components/AmplifyWrapper';
import { ThemeSynchronizer } from '@/app/components/ThemeSynchronizer';
import NavBarHeader2 from '@/app/components/iu-plugin/NavBarHeader2';
import { Footer } from '@/app/components/Footer';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { AuthProvider } from '@/auth/AuthContext';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../amplify_outputs.json';

// Configure Amplify with the generated outputs
Amplify.configure(amplifyconfig, { ssr: true });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AmplifyWrapper>
          <AuthProvider>
            {/* ThemeSynchronizer component ensures theme is applied at document level */}
            <ThemeSynchronizer />
            <div className="flex flex-col min-h-screen">
              <NavBarHeader2 />

              <main className="flex-grow">
                {children}
              </main>
                <Footer />
              <ScrollToTop />
              
            </div>
          </AuthProvider>
        </AmplifyWrapper>
      </body>
    </html>
  );
}
