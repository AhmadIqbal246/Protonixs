import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { authors, getPostsByAuthor } from "@/data/blog";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata.authors;

export default function AuthorsPage() {
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main editorial-page">
                <Breadcrumbs items={[
                    { name: "Home", path: "/" },
                    { name: "Authors", path: "/authors" },
                ]} />
                <header>
                    <h1>Authors</h1>
                    <p className="page-lede">Meet the people responsible for articles on this site.</p>
                </header>
                <div className="post-list">
                    {authors.map((author) => (
                        <article className="author-card" key={author.slug}>
                            <Image
                                alt={author.name}
                                className="author-photo"
                                height={68}
                                src={author.image}
                                width={68}
                            />
                            <div>
                                <h2><Link href={`/authors/${author.slug}`}>{author.name}</Link></h2>
                                <p>{author.role}</p>
                                <p>{getPostsByAuthor(author.slug).length} published articles</p>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
