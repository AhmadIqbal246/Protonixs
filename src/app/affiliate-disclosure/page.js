import EditorialPage from "@/components/pages/EditorialPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";

export const metadata = buildMetadata({
    title: "Affiliate Disclosure | Protonixs Journal",
    description: "How Protonixs Journal identifies affiliate relationships.",
    path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
    return (
        <EditorialPage title="Affiliate Disclosure" path="/affiliate-disclosure">
            <p>
                Protonixs Journal does not currently publish affiliate links. If we add
                affiliate links in the future, we will identify them clearly near the
                relevant recommendation. A link may earn the publisher a commission if you
                make a purchase, at no additional cost to you.
            </p>
            <p>
                Any future recommendation will reflect the author&apos;s stated assessment.
                Compensation will not guarantee a positive review or determine an article&apos;s
                conclusions. Questions can be sent to{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            </p>
        </EditorialPage>
    );
}
