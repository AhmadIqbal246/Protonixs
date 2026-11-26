import { getAllPosts } from "@/data/blog";
import { siteConfig } from "@/lib/seo/site-config";

function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export function GET() {
    const items = getAllPosts().map((post) => `
        <item>
            <title>${escapeXml(post.title)}</title>
            <link>${siteConfig.url}/blog/${escapeXml(post.slug)}</link>
            <guid>${siteConfig.url}/blog/${escapeXml(post.slug)}</guid>
            <description>${escapeXml(post.description)}</description>
            <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
        </item>
    `).join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
            <channel>
                <title>${escapeXml(siteConfig.name)} Journal</title>
                <link>${siteConfig.url}</link>
                <description>Articles on AI tools, web development, and technology.</description>
                ${items}
            </channel>
        </rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
    });
}
