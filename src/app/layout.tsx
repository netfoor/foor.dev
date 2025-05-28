import './globals.css';
import './theme-colors.css';
import '@aws-amplify/ui-react/styles.css';
import { AmplifyWrapper } from '@/app/components/AmplifyWrapper';
import { ThemeSynchronizer } from '@/app/components/ThemeSynchronizer';
import { ThemeDebugger } from '@/app/components/ThemeDebugger';
import NavBarHeader2 from '@/app/components/iu-plugin/NavBarHeader2';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AmplifyWrapper>
          {/* ThemeSynchronizer component ensures theme is applied at document level */}
          <ThemeSynchronizer />
          <div className="flex flex-col min-h-screen">
            <NavBarHeader2 />

            <main className="flex-grow">
              {children}
            </main>
            
            <ThemeDebugger />

            
          </div>
        </AmplifyWrapper>
      </body>
    </html>
  );
}
