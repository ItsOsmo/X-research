import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ variant = 'auto', size = 'md', className }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const logoSrc = variant === 'light' 
    ? 'white_owl.png'
    : 'dark_owl.png';

  return (
    <img 
      src={logoSrc}
      alt="XResearch Logo"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export default Logo;