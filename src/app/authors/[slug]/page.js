import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PostListing from "@/components/blog/PostListing";
import { authors, getAuthorBySlug, getPostsByAuthor } from "@/data/blog";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
    return authors.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const author = getAuthorBySlug(params.slug);
    if (!author) {
        return { title: "Author Not Found | Protonixs Journal", robots: { index: false, follow: false } };
    }
    return buildMetadata({
        title: `${author.name} | Protonixs Journal`,
        description: author.bio,
        path: `/authors/${author.slug}`,
    });
}

export default function AuthorPage({ params }) {
    const author = getAuthorBySlug(params.slug);
    if (!author) notFound();
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main editorial-page">
                <Breadcrumbs items={[
                    { name: "Home", path: "/" },
                    { name: "Authors", path: "/authors" },
                    { name: author.name, path: `/authors/${author.slug}` },
                ]} />
                <header className="author-card">
                    <Image
                        alt={author.name}
                        className="author-photo"
                        height={100}
                        src={author.image}
                        width={100}
                    />
                    <div>
                        <h1>{author.name}</h1>
                        <p>{author.role}</p>
                        <p>{author.bio}</p>
                        <a href={`mailto:${author.email}`}>Email the author</a>
                    </div>
                </header>
                <PostListing
                    title={`Articles by ${author.name}`}
                    description="Published articles by this author."
                    posts={getPostsByAuthor(author.slug)}
                />
            </main>
            <Footer />
        </div>
    );
}
