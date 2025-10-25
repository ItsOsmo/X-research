import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';

interface HeaderProps {
  showAuthInfo?: boolean;
}

const Header = ({ showAuthInfo = true }: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="dark" size="md" />
            <span className="font-semibold text-lg">xResearch</span>
          </div>
          
          {showAuthInfo && user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;