import { siteConfig } from "@/lib/seo/site-config";
import { authors, categories, getAllPostSlugs, getAllTags, getPostsByCategory } from "@/data/blog";

export default function sitemap() {
    const staticRoutes = [
        "",
        "/blog",
        "/about",
        "/contact",
        "/privacy",
        "/terms",
        "/disclaimer",
        "/cookies",
        "/affiliate-disclosure",
        "/authors",
    ];
    const now = new Date();
    const staticEntries = staticRoutes.map((route) => ({
        url: `${siteConfig.url}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.7,
    }));
    const categoryEntries = categories.filter(({ slug }) => getPostsByCategory(slug).length > 0).map(({ slug }) => ({
        url: `${siteConfig.url}/category/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
    }));
    const authorEntries = authors.map(({ slug }) => ({
        url: `${siteConfig.url}/authors/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
    }));
    const tagEntries = getAllTags().map(({ slug }) => ({
        url: `${siteConfig.url}/tag/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.4,
    }));
    const articleEntries = getAllPostSlugs().map((slug) => ({
        url: `${siteConfig.url}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
    }));
    return [...staticEntries, ...categoryEntries, ...authorEntries, ...tagEntries, ...articleEntries];
}
