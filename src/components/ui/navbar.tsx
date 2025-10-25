import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavLink {
    text: string;
    href: string;
}

interface AuthLinkBase {
    text: string;
    href: string;
    className?: string;
}

interface AuthLinkTypeLink extends AuthLinkBase {
    type: 'link';
}

interface AuthLinkTypeButtonOutline extends AuthLinkBase {
    type: 'button-outline';
}

interface AuthLinkTypeButtonPrimary extends AuthLinkBase {
    type: 'button-primary';
}

type AuthLink = AuthLinkTypeLink | AuthLinkTypeButtonOutline | AuthLinkTypeButtonPrimary;

interface NavbarProps {
    logoText: string;
    navLinks: NavLink[];
    authLinks: AuthLink[];
    onMenuOpen?: () => void;
}

interface MobileMenuProps {
    navLinks: NavLink[];
    authLinks: AuthLink[];
    logoText: string;
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps & { navigate: ReturnType<typeof useNavigate> }> = ({
    navLinks, authLinks, logoText, isOpen, onClose, navigate
}) => {
    const renderLogo = () => (
        <div className="flex items-center space-x-2">
            <img 
                src="dark_owl.png" 
                alt="XResearch Logo"
                className="h-7 w-7"
            />
            <span className="text-xl font-bold text-foreground">{logoText}</span>
        </div>
    );

    const renderMobileNavLinks = (links: NavLink[]) => (
        <div className="flex flex-col space-y-4 mt-8">
            {links.map((link, index) => (
                <a key={index} href={link.href} className="text-foreground text-lg font-medium hover:text-primary" onClick={onClose}>
                    {link.text}
                </a>
            ))}
        </div>
    );

    const renderMobileAuthLinks = (links: AuthLink[]) => (
        <div className="flex flex-col space-y-4 mt-8 pt-6 border-t border-border">
            {links.map((link, index) => {
                if (link.type === 'link') {
                    return (
                        <a key={index} href={link.href} className={`text-muted-foreground hover:text-primary text-lg ${link.className}`} onClick={onClose}>
                            {link.text}
                        </a>
                    );
                } else if (link.type === 'button-outline') {
                    return (
                        <button key={index} className={`px-4 py-3 border border-border rounded-md text-foreground hover:bg-accent text-lg font-semibold ${link.className}`} onClick={onClose}>
                            {link.text}
                        </button>
                    );
                } else if (link.type === 'button-primary') {
                    return (
                        <button key={index} className={`px-4 py-3 bg-primary text-primary-foreground rounded-md font-semibold text-lg ${link.className}`} onClick={() => navigate('/auth')}>
                            {link.text}
                        </button>
                    );
                }
                return null;
            })}
        </div>
    );

    return (
        <div className={`
            fixed inset-0 z-40 bg-background transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            lg:hidden
            overflow-y-auto
            p-8
        `}>
            <div className="flex items-center justify-between mb-8">
                {renderLogo()}
                <button
                    className="text-muted-foreground hover:text-primary focus:outline-none"
                    onClick={onClose}
                    aria-label="Close mobile menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            {renderMobileNavLinks(navLinks)}
            {renderMobileAuthLinks(authLinks)}
        </div>
    );
};

export const Navbar: React.FC<NavbarProps> = ({ logoText, navLinks, authLinks, onMenuOpen }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleMenuOpen = () => {
        setIsMobileMenuOpen(true);
        onMenuOpen?.();
    };

    const renderLogo = () => (
        <div className="flex items-center space-x-2">
            <img 
                src="dark_owl.png" 
                alt="XResearch Logo"
                className="h-7 w-7"
            />
            <span className="text-xl font-bold text-foreground">{logoText}</span>
        </div>
    );

    const renderDesktopNavLinks = (links: NavLink[]) => (
        <ul className="hidden lg:flex items-center space-x-6">
            {links.map((link, index) => (
                <li key={index}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {link.text}
                    </a>
                </li>
            ))}
        </ul>
    );

    const renderDesktopAuthLinks = (links: AuthLink[]) => (
        <div className="hidden lg:flex items-center space-x-4">
            {links.map((link, index) => {
                if (link.type === 'link') {
                    return (
                        <a key={index} href={link.href} className={`text-muted-foreground hover:text-primary transition-colors ${link.className}`}>
                            {link.text}
                        </a>
                    );
                } else if (link.type === 'button-outline') {
                    return (
                        <button key={index} className={`px-4 py-2 border border-border rounded-md text-foreground hover:bg-accent transition-colors ${link.className}`}>
                            {link.text}
                        </button>
                    );
                } else if (link.type === 'button-primary') {
                    return (
                        <button key={index} onClick={() => navigate('/auth')} className={`px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold transition-colors ${link.className}`}>
                            {link.text}
                        </button>
                    );
                }
                return null;
            })}
        </div>
    );

    return (
        <>
            <nav className="bg-card rounded-xl relative z-10 max-w-6xl mx-auto flex items-center justify-between py-4 px-8 lg:px-12 lg:py-4 shadow-sm border">
                {renderLogo()}

                <div className="flex items-center space-x-6 text-sm">
                    {renderDesktopNavLinks(navLinks)}
                    {renderDesktopAuthLinks(authLinks)}
                </div>

                <button
                    className="lg:hidden text-muted-foreground hover:text-primary focus:outline-none transition-colors"
                    onClick={handleMenuOpen}
                    aria-label="Open mobile menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
            </nav>

            <MobileMenu
                navLinks={navLinks}
                authLinks={authLinks}
                logoText={logoText}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                navigate={navigate}
            />
        </>
    );
};

export default Navbar;