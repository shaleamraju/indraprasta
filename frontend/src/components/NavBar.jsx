import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Hotel } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
    { id: "home", label: "Home", type: 'route', to: '/' },
    { id: "about", label: "About", type: 'section', target: "about_us" },
    { id: "gallery", label: "Gallery", type: 'section', target: "gallery" },
    { id: "booking", label: "Booking", type: 'route', to: '/booking' },
    { id: "track", label: "Track", type: 'route', to: '/track' },
    { id: "amenities", label: "Amenities", type: 'section', target: "amenities" },
    { id: "services", label: "Services", type: 'section', target: "services" },
    { id: "contact", label: "Contact", type: 'section', target: "contact_us" },
    { id: "admin", label: "Admin", type: 'route', to: '/admin' },
];

export default function NavBar() {
    const [active, setActive] = useState("home");
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    useAuth();

    const routeActiveId = useCallback((pathname) => {
        if (pathname === '/booking') return 'booking';
        if (pathname === '/admin') return 'admin';
        return 'home';
    }, []);

    useEffect(() => {
        if (location.pathname !== '/') {
            requestAnimationFrame(() => setActive(routeActiveId(location.pathname)));
            return;
        }
        const sectionLinks = LINKS.filter(l => l.type === 'section');
        const sections = sectionLinks.map(l => ({ id: l.id, el: document.getElementById(l.target) }));
        function onScroll() {
            const offset = window.scrollY + 90;
            let current = 'home';
            for (const s of sections) {
                if (!s.el) continue;
                if (offset >= s.el.offsetTop) current = s.id;
            }
            setActive(current);
        }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [location.pathname, routeActiveId]);

    function handleNavClick(e, link) {
        e.preventDefault();
        setIsOpen(false);
        if (link.type === 'route') {
            navigate(link.to);
            setActive(link.id);
        } else if (link.type === 'section') {
            if (location.pathname !== '/') navigate('/');
            requestAnimationFrame(() => {
                const el = document.getElementById(link.target);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            setActive(link.id);
        }
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-hotel-primary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 bg-hotel-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <Hotel className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold text-hotel-secondary font-display tracking-tight">
                                Indraprasta
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        {LINKS.map(l => (
                            <a
                                key={l.id}
                                href={l.type === 'route' ? l.to : `#${l.target}`}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    active === l.id
                                    ? 'bg-hotel-primary text-white shadow-md'
                                    : 'text-hotel-secondary hover:bg-hotel-primary/10 hover:text-hotel-primary'
                                }`}
                                onClick={(e) => handleNavClick(e, l)}
                            >
                                {l.label}
                            </a>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-hotel-secondary hover:bg-hotel-primary/10 transition-colors"
                        >
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-20 left-0 right-0 bg-white border-b border-hotel-primary/20 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 py-6 space-y-2">
                    {LINKS.map(l => (
                        <a
                            key={l.id}
                            href={l.type === 'route' ? l.to : `#${l.target}`}
                            className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                                active === l.id
                                ? 'bg-hotel-primary text-white'
                                : 'text-hotel-secondary hover:bg-hotel-primary/10 hover:text-hotel-primary'
                            }`}
                            onClick={(e) => handleNavClick(e, l)}
                        >
                            {l.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
}
