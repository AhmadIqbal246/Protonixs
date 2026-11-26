import EditorialPage from "@/components/pages/EditorialPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";

export const metadata = buildMetadata({
    title: "Disclaimer | Protonixs Journal",
    description: "Important information about the technical articles and opinions published on Protonixs Journal.",
    path: "/disclaimer",
});

export default function DisclaimerPage() {
    return (
        <EditorialPage title="Disclaimer" path="/disclaimer">
            <h2>General information</h2>
            <p>
                Articles on Protonixs Journal are for general educational and informational
                purposes. They are not professional, legal, financial, or security advice.
                Make decisions based on your own requirements and qualified advice.
            </p>
            <h2>Technical accuracy</h2>
            <p>
                Software, services, prices, and APIs change. We work to identify article
                dates and updates, but cannot guarantee that every example remains current
                or works in every environment. Review code before using it, and do not expose
                secrets or production data when testing examples.
            </p>
            <h2>Opinions and results</h2>
            <p>
                Opinions belong to their named authors. Results described in an article
                apply to the stated context and are not a promise that another project will
                produce the same result.
            </p>
            <h2>Corrections</h2>
            <p>
                If you find an error, please contact{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> with the page
                URL and the correction you believe is needed.
            </p>
        </EditorialPage>
    );
}
