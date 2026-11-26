import { pageMetadata } from "@/lib/seo/metadata";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = pageMetadata.notFound;

export default function NotFound() {
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main not-found">
                <h1>Page not found</h1>
                <p>The page may have moved or the address may be incorrect.</p>
                <Link className="button" href="/">Go to the journal</Link>
            </main>
            <Footer />
        </div>
    );
}
