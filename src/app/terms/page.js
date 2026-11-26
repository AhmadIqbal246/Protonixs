import EditorialPage from "@/components/pages/EditorialPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";

export const metadata = buildMetadata({
    title: "Terms and Conditions | Protonixs Journal",
    description: "Terms that apply when you access and use Protonixs Journal.",
    path: "/terms",
});

export default function TermsPage() {
    return (
        <EditorialPage title="Terms and Conditions" path="/terms">
            <p>
                By using Protonixs Journal, you agree to these terms. If you do not agree,
                please stop using the site.
            </p>
            <h2>Site material</h2>
            <p>
                Articles and other materials are provided for general information. Unless a
                page says otherwise, the site and its materials are owned by or licensed to
                {` ${siteConfig.legalName}`}. You may link to public pages. Do not republish
                an article in full without written permission.
            </p>
            <h2>Acceptable use</h2>
            <p>
                Do not interfere with the site, attempt unauthorized access, submit unlawful
                material, or use the contact form to send spam or harmful files.
            </p>
            <h2>External services and links</h2>
            <p>
                The site may link to third-party services and documentation. We do not
                control those sites and are not responsible for their content, availability,
                or privacy practices.
            </p>
            <h2>Changes and contact</h2>
            <p>
                We may update the site or these terms. Questions about these terms can be sent
                to <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            </p>
        </EditorialPage>
    );
}
