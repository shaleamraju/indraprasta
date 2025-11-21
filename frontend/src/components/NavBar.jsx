import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import "./NavBar.css";

// type: 'section' anchors only valid on home route '/', type: 'route' uses react-router navigation
const LINKS = [
    { id: "home", label: "Home", type: 'route', to: '/' },
    { id: "about", label: "About", type: 'section', target: "about_us" },
    { id: "gallery", label: "Gallery", type: 'section', target: "gallery" },
    { id: "booking", label: "Booking", type: 'route', to: '/booking' },
    { id: "amenities", label: "Amenities", type: 'section', target: "amenities" },
    { id: "services", label: "Services", type: 'section', target: "services" },
    { id: "contact", label: "Contact", type: 'section', target: "contact_us" },
    { id: "admin", label: "Admin", type: 'route', to: '/admin' },
];

export default function NavBar() {
    const [active, setActive] = useState("home");
    const location = useLocation();
    const navigate = useNavigate();
    // Auth context still available if needed later; currently not used
    useAuth();

    const routeActiveId = useCallback((pathname) => {
        if (pathname === '/booking') return 'booking';
        if (pathname === '/admin') return 'admin';
        return 'home';
    }, []);

    useEffect(() => {
        if (location.pathname !== '/') {
            // defer state update to next tick to avoid sync setState warning
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
        if (link.type === 'route') {
            navigate(link.to);
            setActive(link.id);
        } else if (link.type === 'section') {
            if (location.pathname !== '/') navigate('/');
            // Delay scroll until after route change if needed
            requestAnimationFrame(() => {
                const el = document.getElementById(link.target);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            setActive(link.id);
        }
    }

    return (
        <nav className="Navbar-container">
            <div className="Navbar-inner">
                <div className="Navbar-logo-wrap">
                    <img
                        className="Navbar-logo"
                        src="https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/n300_100a/image/upload/v1602769798/business/79fed3c5-cfbb-4a78-abe3-10b28e622a1f.jpg"
                        alt="Logo"
                    />
                </div>
                <div className="Navbar-links">
                    {LINKS.map(l => (
                        <a
                          key={l.id}
                          href={l.type === 'route' ? l.to : `#${l.target}`}
                          className={`nav-link ${active === l.id ? 'active' : ''}`}
                          onClick={(e) => handleNavClick(e, l)}
                        >{l.label}</a>
                    ))}
                </div>
            </div>
        </nav>
    );
}