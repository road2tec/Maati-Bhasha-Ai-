import Link from 'next/link';
import { BotMessageSquare, Twitter, Github, Linkedin } from 'lucide-react';

const footerLinks = {
  quickLinks: [
    { href: '/', label: 'Home' },
    { href: '/translator', label: 'Translator' },
  ],
  supportedDialects: [
    { href: '#', label: 'Standard Marathi' },
    { href: '#', label: 'Pune Marathi' },
    { href: '#', label: 'Mumbai Marathi' },
    { href: '#', label: 'Nagpur Marathi' },
    { href: '#', label: 'Konkan Marathi' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="bg-primary p-2 rounded-md">
                <BotMessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                MaatiBhasha AI
              </h1>
            </Link>
            <p className="max-w-md text-sidebar-foreground/70">
              Advanced Marathi dialect translation system powered by AI. Preserving the
              richness of Marathi language across different regions of Maharashtra.
            </p>
             <p className="mt-2 text-sm text-sidebar-foreground/50">
               मराठी भाषेच्या विविध प्रादेशिक रूपांचे जतन करणारी, कृत्रिम बुद्धिमत्तेवर आधारित प्रगत अनुवाद प्रणाली.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sidebar-foreground/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Supported Dialects */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Supported Dialects</h3>
            <ul className="space-y-2">
              {footerLinks.supportedDialects.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sidebar-foreground/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sidebar-border flex flex-col sm:flex-row justify-between items-center">
           <p className="text-sm text-sidebar-foreground/50">
            &copy; {currentYear} MaatiBhasha AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
             <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-sidebar-foreground/70 hover:text-primary transition-colors"/>
             </Link>
             <Link href="#" aria-label="GitHub">
                <Github className="h-5 w-5 text-sidebar-foreground/70 hover:text-primary transition-colors"/>
             </Link>
             <Link href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-sidebar-foreground/70 hover:text-primary transition-colors"/>
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
