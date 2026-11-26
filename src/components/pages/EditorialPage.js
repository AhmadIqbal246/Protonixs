import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function EditorialPage({ title, description, path, children }) {
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main editorial-page">
                <Breadcrumbs items={[
                    { name: "Home", path: "/" },
                    { name: title, path },
                ]} />
                <header>
                    <h1>{title}</h1>
                    {description ? <p className="page-lede">{description}</p> : null}
                </header>
                <div className="editorial-content">{children}</div>
            </main>
            <Footer />
        </div>
    );
}
