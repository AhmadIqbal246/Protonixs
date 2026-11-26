import Link from "next/link";
import { authors } from "@/data/blog";

function formatDate(date) {
    return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" })
        .format(new Date(`${date}T00:00:00Z`));
}

export default function PostListing({
    title,
    description,
    posts,
    threeColumn = false,
    query = "",
    currentPage = 1,
    pageCount = 1,
    basePath = "/blog",
}) {
    return (
        <>
            <header className="page-intro">
                <h1>{title}</h1>
                <p>{description}</p>
            </header>
            <section aria-label="Find articles" className="blog-tools">
                <form action="/blog" className="search-form" method="get" role="search">
                    <label className="sr-only" htmlFor="article-search">Search articles</label>
                    <input
                        className="search-input"
                        id="article-search"
                        name="q"
                        placeholder="Search articles"
                        type="search"
                        defaultValue={query}
                    />
                    <button className="button" type="submit">Search</button>
                </form>
            </section>
            {posts.length ? (
                <div className={`post-list${threeColumn ? " post-list--three" : ""}`}>
                    {posts.map((post) => {
                        const author = authors.find((item) => item.slug === post.author);
                        return (
                            <article className="post-card" key={post.slug}>
                                <Link
                                    aria-label={`Read ${post.title}`}
                                    className="post-card-link"
                                    href={`/blog/${post.slug}`}
                                />
                                <div className="post-meta">
                                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                                    {post.updated && post.updated !== post.date ? (
                                        <span>Updated {formatDate(post.updated)}</span>
                                    ) : null}
                                    {author ? <Link href={`/authors/${author.slug}`}>By {author.name}</Link> : null}
                                </div>
                                <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
                                <p>{post.description}</p>
                                {post.tags?.length ? (
                                    <div aria-label="Article tags" className="tag-list">
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
                            </article>
                        );
                    })}
                </div>
            ) : (
                <section className="empty-state" aria-live="polite">
                    <h2>{query ? "No matching articles" : "No articles published yet"}</h2>
                    <p>
                        {query
                            ? "Try a different search term or browse the categories above."
                            : "The article archive will appear here as original, reviewed posts are published."}
                    </p>
                </section>
            )}
            {pageCount > 1 ? (
                <nav className="pagination" aria-label="Article pagination">
                    {currentPage > 1 ? (
                        <Link href={`${basePath}?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(currentPage - 1) })}`}>
                            Previous
                        </Link>
                    ) : <span />}
                    <span>Page {currentPage} of {pageCount}</span>
                    {currentPage < pageCount ? (
                        <Link href={`${basePath}?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(currentPage + 1) })}`}>
                            Next
                        </Link>
                    ) : <span />}
                </nav>
            ) : null}
        </>
    );
}
