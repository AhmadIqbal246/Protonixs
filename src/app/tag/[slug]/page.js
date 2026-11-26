import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PostListing from "@/components/blog/PostListing";
import { getAllTags, getPostsByTag } from "@/data/blog";
import { buildMetadata } from "@/lib/seo/metadata";

const pageSize = 8;

export function generateStaticParams() {
    return getAllTags().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const tag = getAllTags().find((item) => item.slug === params.slug);
    if (!tag) {
        return { title: "Tag Not Found | Protonixs Journal", robots: { index: false, follow: false } };
    }
    return buildMetadata({
        title: `${tag.name} Articles | Protonixs Journal`,
        description: `Articles tagged ${tag.name} on Protonixs Journal.`,
        path: `/tag/${tag.slug}`,
    });
}

export default function TagPage({ params, searchParams = {} }) {
    const tag = getAllTags().find((item) => item.slug === params.slug);
    if (!tag) notFound();
    const page = Math.max(1, Number.parseInt(searchParams.page, 10) || 1);
    const posts = getPostsByTag(tag.slug);
    const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
    if (posts.length && page > pageCount) notFound();
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main">
                <Breadcrumbs items={[
                    { name: "Home", path: "/" },
                    { name: "Articles", path: "/blog" },
                    { name: `Tag: ${tag.name}`, path: `/tag/${tag.slug}` },
                ]} />
                <PostListing
                    title={`Articles tagged “${tag.name}”`}
                    description={`Browse published articles tagged ${tag.name}.`}
                    posts={posts.slice((page - 1) * pageSize, page * pageSize)}
                    currentPage={page}
                    pageCount={pageCount}
                    basePath={`/tag/${tag.slug}`}
                />
            </main>
            <Footer />
        </div>
    );
}
