import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import "./NavBar.css";

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
        if (pathname === '/track') return 'track';
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
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo-wrap">
                    <div className="logo-icon">H</div>
                    <span className="logo-text">Indraprastha</span>
                </Link>

                <div className="navbar-links-desktop">
                    {LINKS.map(l => (
                        <a
                            key={l.id}
                            href={l.type === 'route' ? l.to : `#${l.target}`}
                            className={`nav-link ${active === l.id ? 'active' : ''}`}
                            onClick={(e) => handleNavClick(e, l)}
                        >{l.label}</a>
                    ))}
                </div>

                <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : '☰'}
                </button>
            </div>

            <div className={`navbar-links-mobile ${isOpen ? 'open' : ''}`}>
                {LINKS.map(l => (
                    <a
                        key={l.id}
                        href={l.type === 'route' ? l.to : `#${l.target}`}
                        className={`nav-link-mobile ${active === l.id ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, l)}
                    >{l.label}</a>
                ))}
            </div>
        </nav>
    );
}
