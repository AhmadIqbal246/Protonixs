"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";

const categories = [
    { name: "AI Tools", href: "/category/ai-tools" },
    { name: "Web Development", href: "/category/web-development" },
    { name: "Tech News", href: "/category/tech-news" },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        try {
            const savedTheme = window.localStorage.getItem("protonixs-theme");
            if (savedTheme === "light" || savedTheme === "dark") {
                document.documentElement.dataset.theme = savedTheme;
                setTheme(savedTheme);
            } else {
                setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
            }
        } catch (error) {
            console.warn("Could not read the saved theme preference.", error);
        }
    }, []);

    function toggleTheme() {
        const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        const nextTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = nextTheme;
        setTheme(nextTheme);
        try {
            window.localStorage.setItem("protonixs-theme", nextTheme);
        } catch (error) {
            console.warn("Could not save the selected theme.", error);
        }
    }

    return (
        <header className="site-header">
            <div className="header-inner">
                <Link className="site-brand" href="/" onClick={() => setMenuOpen(false)}>
                    Protonixs Journal
                </Link>
                <nav aria-label="Main navigation" className="nav-links">
                    <Link href="/">Home</Link>
                    {categories.map((category) => (
                        <Link href={category.href} key={category.href}>{category.name}</Link>
                    ))}
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>
                </nav>
                <div className="header-actions">
                    <button
                        className="theme-toggle"
                        type="button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                        title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                    >
                        {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
                    </button>
                    <button
                        className="menu-toggle"
                        type="button"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? "Close" : "Menu"}
                    </button>
                </div>
            </div>
            <nav
                id="mobile-navigation"
                className="mobile-nav"
                data-open={menuOpen}
                aria-label="Mobile navigation"
            >
                <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
                {categories.map((category) => (
                    <Link href={category.href} key={category.href} onClick={() => setMenuOpen(false)}>
                        {category.name}
                    </Link>
                ))}
                <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </nav>
        </header>
    );
}
