import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import {
    authors,
    categories,
    getAllPosts,
    getPostBySlug,
} from "@/data/blog";

function formatDate(date) {
    return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" })
        .format(new Date(`${date}T00:00:00Z`));
}

export default function BlogPostPage({ params }) {
    const post = getPostBySlug(params.slug);
    if (!post) notFound();

    const author = authors.find((item) => item.slug === post.author) || authors[0];
    if (!author) notFound();
    const category = categories.find((item) => item.slug === post.category);
    const relatedPosts = getAllPosts()
        .filter((item) => item.slug !== post.slug && item.category === post.category)
        .slice(0, 3);
    const breadcrumbs = [
        { name: "Home", path: "/" },
        { name: "Articles", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
    ];

    return (
        <div className="site-shell">
            <JsonLd data={[articleSchema({ ...post, authorName: author.name }), breadcrumbSchema(breadcrumbs)]} />
            <Navbar />
            <main className="site-main">
                <nav aria-label="Breadcrumbs" className="breadcrumbs">
                    <ol>
                        {breadcrumbs.map((item, index) => (
                            <li key={item.path}>
                                {index === breadcrumbs.length - 1
                                    ? item.name
                                    : <Link href={item.path}>{item.name}</Link>}
                            </li>
                        ))}
                    </ol>
                </nav>
                <article className="article">
                    <header className="article-header">
                        <div className="post-meta">
                            <time dateTime={post.date}>Published {formatDate(post.date)}</time>
                            {post.updated && post.updated !== post.date ? (
                                <time dateTime={post.updated}>Updated {formatDate(post.updated)}</time>
                            ) : null}
                            <Link href={`/authors/${author.slug}`}>By {author.name}</Link>
                            {category ? <Link href={`/category/${category.slug}`}>{category.name}</Link> : null}
                        </div>
                        <h1>{post.title}</h1>
                        <p className="page-lede">{post.description}</p>
                    </header>
                    <div className="article-content">
                        <ReactMarkdown
                            components={{
                                a: ({ href = "", children }) => href.startsWith("/")
                                    ? <Link href={href}>{children}</Link>
                                    : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>
                    {post.tags?.length ? (
                        <div className="tag-list" aria-label="Article tags">
                            {post.tags.map((tag) => (
                                <Link
                                    className="tag-chip"
                                    href={`/tag/${tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                                    key={tag}
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    ) : null}
                    <aside className="author-card">
                        <Image
                            alt={author.name}
                            className="author-photo"
                            height={68}
                            src={author.image}
                            width={68}
                        />
                        <div>
                            <strong><Link href={`/authors/${author.slug}`}>{author.name}</Link></strong>
                            <p>{author.role}</p>
                            <p>{author.bio}</p>
                        </div>
                    </aside>
                    {relatedPosts.length ? (
                        <section className="related-posts" aria-labelledby="related-title">
                            <h2 id="related-title">Related articles</h2>
                            <ul>
                                {relatedPosts.map((related) => (
                                    <li key={related.slug}>
                                        <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}
                </article>
            </main>
            <Footer />
        </div>
    );
}
