import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PostListing from "@/components/blog/PostListing";
import { getAllPosts } from "@/data/blog";

const pageSize = 8;

export default function BlogPage({ searchParams = {} }) {
    const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
    const page = Math.max(1, Number.parseInt(searchParams.page, 10) || 1);
    const normalizedQuery = query.toLowerCase();
    const filteredPosts = getAllPosts().filter((post) => {
        const searchable = `${post.title} ${post.description} ${(post.tags || []).join(" ")}`.toLowerCase();
        return searchable.includes(normalizedQuery);
    });
    const pageCount = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
    if (filteredPosts.length && page > pageCount) notFound();

    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main">
                <PostListing
                    title={query ? `Search: ${query}` : "All articles"}
                    description="Browse notes and guides on AI tools, web development, and technology."
                    posts={filteredPosts.slice((page - 1) * pageSize, page * pageSize)}
                    query={query}
                    currentPage={page}
                    pageCount={pageCount}
                    basePath="/blog"
                />
            </main>
            <Footer />
        </div>
    );
}
