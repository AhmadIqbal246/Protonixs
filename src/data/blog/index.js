import fs from "node:fs";
import path from "node:path";

export const categories = [
    {
        slug: "ai-tools",
        name: "AI Tools",
        description: "Hands-on notes about AI products, models, and practical workflows.",
    },
    {
        slug: "web-development",
        name: "Web Development",
        description: "Guides and lessons from building websites and web applications.",
    },
    {
        slug: "tech-news",
        name: "Tech News",
        description: "Context and explainers on developments across technology.",
    },
];

export const authors = [
    {
        slug: "ahmad-iqbal",
        name: "M. Ahmad Iqbal",
        role: "Founder, Protonixs",
        bio: "M. Ahmad Iqbal is the founder of Protonixs. He writes about the technology and software projects the team works with.",
        image: "/OurTeam/Ahmad linked in.png",
        email: "ahmad@protonixs.com",
    },
];

// Add only reviewed, original articles with verified details and a named author.
const articleRoot = path.join(process.cwd(), "Articles");

function readArticle(fileName, bodyMarker) {
    const article = fs.readFileSync(path.join(articleRoot, fileName), "utf8");
    if (!bodyMarker) return article.trim();

    const markerIndex = article.indexOf(bodyMarker);
    if (markerIndex === -1) return article.trim();
    return article.slice(markerIndex).trimStart();
}

const posts = [
    {
        slug: "how-safebill-escrow-system-works",
        title: "How SafeBill’s Escrow works",
        description: "Discover more about how SafeBill’s escrow service works, including staged payments and approval along with Stripe Connect. Additional takeaways are provided.",
        date: "2026-11-26",
        updated: "2026-11-26",
        author: "ahmad-iqbal",
        category: "web-development",
        tags: ["Escrow", "Freelance Escrow", "Staged Payments", "SafeBill", "Stripe Connect"],
        content: readArticle("SafeBill-Article.md", "Having experienced"),
    },
    {
        slug: "rebuilt-roofing-crm-kanban-tenant-workflows",
        title: "Rebuilt roofing CRM Kanban, tenant workflows and updating jobs",
        description: "Information on my experience of converting a non-tenant roofing Kanban to tenant workflows, statuses and boards. Details of how to update jobs is also provided. Coding and learning points included.",
        date: "2026-11-25",
        author: "ahmad-iqbal",
        category: "web-development",
        tags: ["Roofing CRM", "Multi-tenant SaaS", "Django REST Framework", "Next.js Kanban", "Workflow"],
        content: readArticle("FieldFlow-Article.md"),
    },
    {
        slug: "read-only-external-api-multi-tenant-crm",
        title: "Read Only External API for Multi-tenant CRM (and the Authentication Error that Derailed Bots)",
        description: "Creating a read only external API for FieldFlow with tenant-specific API keys. Also including fiscal calendar functionality and the authenticating error that caused all my bots to fail on day one. With real examples.",
        date: "2026-11-24",
        author: "ahmad-iqbal",
        category: "web-development",
        tags: ["Read Only CRM API", "Multi-tenant API Keys", "Django REST Throttling", "Fiscal Calendar", "Tenant Isolation"],
        content: readArticle("FieldFlow-Article1.md", "---"),
    },
    {
        slug: "how-i-built-ai-chatbot-that-only-answers-from-website-content",
        title: "How I Built an AI Chatbot That Only Answers From Your Website",
        description: "A behind-the-scenes account of building an AI chatbot that uses website content, crawling, chunking, vector search and re-ranking instead of inventing answers.",
        date: "2026-11-23",
        author: "ahmad-iqbal",
        category: "ai-tools",
        tags: ["AI Chatbot", "RAG", "Website AI Assistant", "Pinecone", "Cohere"],
        content: readArticle("Swoop-AI-Article.md", "---"),
    },
    {
        slug: "multi-tenant-ai-chatbot-per-tenant-data-isolation",
        title: "How I built a multi-tenant AI chatbot, with per-tenant isolation",
        description: "My method for tenant isolation in a multi-tenant AI chatbot, including namespace isolation, reindexing and the migration involved.",
        date: "2026-11-22",
        author: "ahmad-iqbal",
        category: "ai-tools",
        tags: ["Multi-tenant AI Chatbot", "Per-tenant Data Isolation", "Pinecone Namespace", "RAG", "Data Privacy"],
        content: readArticle("Swoop-AI-Article1.md", "Introduction"),
    },
    {
        slug: "producing-ai-voice-with-twilio-openai",
        title: "Producing AI Voice using Twilio and OpenAI – My experience with Gioconda",
        description: "An analysis of live AI voice calls using Twilio media streams and the OpenAI Realtime API, including audio conversion and session configuration.",
        date: "2026-11-21",
        author: "ahmad-iqbal",
        category: "ai-tools",
        tags: ["AI Voice", "Twilio", "OpenAI Realtime API", "WebSockets", "Audio Conversion"],
        content: readArticle("GiocondaAi-Article.md"),
    },
    {
        slug: "creating-1-click-ai-agents",
        title: "Creating 1-click AI agents",
        description: "Information about the deep-crawl, embedding and 1-click flow within Gioconda.",
        date: "2026-11-20",
        author: "ahmad-iqbal",
        category: "ai-tools",
        tags: ["AI Agents", "Deep Crawl", "Embeddings", "Crawl4AI", "Pinecone"],
        content: readArticle("GiocondaAi-Article1.md", "---"),
    },
    {
        slug: "forge-bootcamp-lms-review",
        title: "Forge Bootcamp",
        description: "Analysis and review of the code, functionality and application features of an open source LMS.",
        date: "2026-11-19",
        author: "ahmad-iqbal",
        category: "web-development",
        tags: ["Forge Bootcamp", "Django", "Next.js", "LMS", "WebSockets"],
        content: readArticle("LMS-Article.md"),
    },
    {
        slug: "axynt-optimising-repository-processing",
        title: "AXYNT – Optimising Repository Processing",
        description: "How GitHub authentication, tree-sitter version compatibility and parsing concurrency resolved repository ingestion failures in AXYNT.",
        date: "2026-11-18",
        author: "ahmad-iqbal",
        category: "ai-tools",
        tags: ["AXYNT", "Repository Processing", "GitHub", "Tree-sitter", "Celery"],
        content: readArticle("Axynt-Article.md"),
    },
];

export function getAllPosts() {
    return posts
        .filter((post) => post.published !== false)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
    return getAllPosts().find((post) => post.slug === slug) || null;
}

export function getAllPostSlugs() {
    return getAllPosts().map((post) => post.slug);
}

export function getCategoryBySlug(slug) {
    return categories.find((category) => category.slug === slug) || null;
}

export function getPostsByCategory(slug) {
    return getAllPosts().filter((post) => post.category === slug);
}

export function slugifyTag(tag) {
    return tag
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function getAllTags() {
    const tags = new Map();
    getAllPosts().forEach((post) => {
        (post.tags || []).forEach((tag) => {
            const slug = slugifyTag(tag);
            if (slug) tags.set(slug, tag);
        });
    });
    return Array.from(tags, ([slug, name]) => ({ slug, name }));
}

export function getPostsByTag(slug) {
    return getAllPosts().filter((post) =>
        (post.tags || []).some((tag) => slugifyTag(tag) === slug)
    );
}

export function getAuthorBySlug(slug) {
    return authors.find((author) => author.slug === slug) || null;
}

export function getPostsByAuthor(slug) {
    return getAllPosts().filter((post) => post.author === slug);
}
