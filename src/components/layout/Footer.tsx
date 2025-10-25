import { Mail, Shield, Globe } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo variant="dark" size="md" />
              <span className="font-semibold text-lg">xResearch</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting researchers with participants for meaningful studies.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>For Researchers</li>
              <li>For Participants</li>
              <li>Study Templates</li>
              <li>Payment Processing</li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="font-semibold">Security</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                SOC 2 Type II
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Data Encryption
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 xResearch. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with security and privacy in mind.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;