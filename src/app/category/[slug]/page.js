import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PostListing from "@/components/blog/PostListing";
import { categories, getCategoryBySlug, getPostsByCategory } from "@/data/blog";
import { buildMetadata } from "@/lib/seo/metadata";

const pageSize = 8;

export function generateStaticParams() {
    return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const category = getCategoryBySlug(params.slug);
    if (!category) {
        return { title: "Category Not Found | Protonixs Journal", robots: { index: false, follow: false } };
    }
    return buildMetadata({
        title: `${category.name} | Protonixs Journal`,
        description: category.description,
        path: `/category/${category.slug}`,
        noIndex: getPostsByCategory(category.slug).length === 0,
    });
}

export default function CategoryPage({ params, searchParams = {} }) {
    const category = getCategoryBySlug(params.slug);
    if (!category) notFound();
    const page = Math.max(1, Number.parseInt(searchParams.page, 10) || 1);
    const posts = getPostsByCategory(category.slug);
    const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
    if (posts.length && page > pageCount) notFound();
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main">
                <Breadcrumbs items={[
                    { name: "Home", path: "/" },
                    { name: "Articles", path: "/blog" },
                    { name: category.name, path: `/category/${category.slug}` },
                ]} />
                <PostListing
                    title={category.name}
                    description={category.description}
                    posts={posts.slice((page - 1) * pageSize, page * pageSize)}
                    currentPage={page}
                    pageCount={pageCount}
                    basePath={`/category/${category.slug}`}
                />
            </main>
            <Footer />
        </div>
    );
}
