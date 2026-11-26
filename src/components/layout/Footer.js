import Link from "next/link";
import { siteConfig } from "@/lib/seo/site-config";

const footerLinks = [
    ["All articles", "/blog"],
    ["RSS feed", "/feed.xml"],
    ["About", "/about"],
    ["Contact", "/contact"],
    ["Privacy policy", "/privacy"],
    ["Terms", "/terms"],
    ["Disclaimer", "/disclaimer"],
    ["Cookie policy", "/cookies"],
    ["Affiliate disclosure", "/affiliate-disclosure"],
    ["Authors", "/authors"],
];

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div>
                    <Link className="site-brand" href="/">Protonixs Journal</Link>
                    <p className="footer-about">
                        Independent notes on AI tools, web development, and technology from Protonixs.
                        Questions or corrections? Contact us at{" "}
                        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                    </p>
                </div>
                <nav className="footer-links" aria-label="Trust and site information">
                    {footerLinks.map(([label, href]) => (
                        <Link href={href} key={href}>{label}</Link>
                    ))}
                </nav>
                <p className="footer-copyright">© {new Date().getFullYear()} Protonixs.</p>
            </div>
        </footer>
    );
}
