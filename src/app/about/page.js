import Link from "next/link";
import EditorialPage from "@/components/pages/EditorialPage";
import { siteConfig } from "@/lib/seo/site-config";

export default function AboutPage() {
    return (
        <EditorialPage
            title="About Protonixs Journal"
            description="A publication from Protonixs about the tools and technologies we work with."
            path="/about"
        >
            <h2>Why this journal exists</h2>
            <p>
                Protonixs Journal covers practical topics in AI tools, web development, and
                technology. Articles are intended to explain a specific problem, show how it
                was investigated, and distinguish tested results from opinion.
            </p>
            <h2>Who publishes it</h2>
            <p>
                The journal is published by Protonixs, a software company based in{" "}
                {siteConfig.address.addressLocality}, {siteConfig.address.addressCountry}.
                Editorial responsibility belongs to the named author shown on each article.
            </p>
            <p>
                Read more about our <Link href="/authors">authors</Link>, or{" "}
                <Link href="/contact">contact us</Link> with a question or correction.
            </p>
        </EditorialPage>
    );
}
