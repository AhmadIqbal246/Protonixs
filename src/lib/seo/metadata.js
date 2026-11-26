import { siteConfig } from "./site-config";

export function buildMetadata({
    title,
    description,
    path = "",
    keywords = [],
    noIndex = false,
    type = "website",
}) {
    const url = `${siteConfig.url}${path}`;
    const image = `${siteConfig.url}${siteConfig.defaultOgImage}`;
    return {
        title,
        description,
        keywords: [...siteConfig.keywords, ...keywords],
        alternates: {
            canonical: url,
            types: { "application/rss+xml": `${siteConfig.url}/feed.xml` },
        },
        openGraph: {
            title,
            description,
            url,
            siteName: `${siteConfig.name} Journal`,
            locale: siteConfig.locale,
            type,
            images: [{ url: image, width: 1200, height: 630, alt: `${siteConfig.name} Journal` }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true, googleBot: { index: true, follow: true } },
    };
}

export const pageMetadata = {
    home: buildMetadata({
        title: "Protonixs Journal | AI, Web Development & Technology",
        description: "Practical articles and notes on AI tools, web development, and technology from Protonixs.",
        path: "/",
    }),
    about: buildMetadata({
        title: "About | Protonixs Journal",
        description: "Learn who publishes Protonixs Journal and what the site covers.",
        path: "/about",
    }),
    contact: buildMetadata({
        title: "Contact | Protonixs Journal",
        description: "Contact the Protonixs Journal team with a question or correction.",
        path: "/contact",
    }),
    blog: buildMetadata({
        title: "Articles | Protonixs Journal",
        description: "Browse articles on AI tools, web development, and technology.",
        path: "/blog",
    }),
    authors: buildMetadata({
        title: "Authors | Protonixs Journal",
        description: "Meet the people who write and review Protonixs Journal articles.",
        path: "/authors",
    }),
    notFound: buildMetadata({
        title: "Page Not Found | Protonixs Journal",
        description: "The requested page could not be found.",
        path: "/404",
        noIndex: true,
    }),
};

export function buildBlogPostMetadata(post) {
    return buildMetadata({
        title: `${post.title} | Protonixs Journal`,
        description: post.description,
        path: `/blog/${post.slug}`,
        keywords: post.tags || [],
        type: "article",
    });
}
