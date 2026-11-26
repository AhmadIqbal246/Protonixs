import { siteConfig } from "./site-config";

export function organizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url: siteConfig.url,
        email: siteConfig.email,
        telephone: siteConfig.phone,
        founder: { "@type": "Person", name: siteConfig.owner },
        sameAs: siteConfig.sameAs,
        logo: `${siteConfig.url}${siteConfig.logo}`,
    };
}

export function breadcrumbSchema(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${siteConfig.url}${item.path}`,
        })),
    };
}

export function faqPageSchema(faqs) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
    };
}

export function websiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: `${siteConfig.name} Journal`,
        url: siteConfig.url,
        publisher: { "@type": "Organization", name: siteConfig.name },
    };
}

export function articleSchema(post) {
    const authorName = post.authorName || siteConfig.owner;
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated || post.date,
        articleSection: post.category,
        keywords: post.tags || [],
        author: {
            "@type": "Person",
            name: authorName,
            url: `${siteConfig.url}/authors/${post.author || "ahmad-iqbal"}`,
        },
        publisher: {
            "@type": "Organization",
            name: `${siteConfig.name} Journal`,
            logo: { "@type": "ImageObject", url: `${siteConfig.url}${siteConfig.logo}` },
        },
        mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    };
}

export function globalSchemas() {
    return [organizationSchema(), websiteSchema()];
}
