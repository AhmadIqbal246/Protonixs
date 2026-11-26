import EditorialPage from "@/components/pages/EditorialPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
    title: "Cookie Policy | Protonixs Journal",
    description: "Details about cookies and similar browser storage used by Protonixs Journal.",
    path: "/cookies",
});

export default function CookiesPage() {
    return (
        <EditorialPage title="Cookie Policy" path="/cookies">
            <h2>What cookies and browser storage do</h2>
            <p>
                Cookies are small files stored by a website or a third party in your
                browser. This site also uses local browser storage to remember your
                selected light or dark theme.
            </p>
            <h2>Analytics</h2>
            <p>
                Google Tag Manager and analytics tags may set or read cookies and similar
                identifiers to measure site use, depending on the tags configured. Google
                explains its technologies in its{" "}
                <a href="https://policies.google.com/technologies/cookies" rel="noopener noreferrer" target="_blank">
                    cookie information
                </a>.
            </p>
            <h2>Advertising cookies</h2>
            <p>
                Advertising is not displayed by default. If Google AdSense is enabled,
                Google and its partners may use cookies or similar identifiers for ad
                delivery, frequency control, measurement, and personalization as permitted
                by your region and consent settings. See the{" "}
                <a href="/privacy">Privacy Policy</a> for information about consent
                requirements.
            </p>
            <h2>Managing preferences</h2>
            <p>
                You can block or remove cookies using your browser settings. Blocking
                cookies may prevent analytics or advertising features from working as
                intended. Your theme preference is stored in local browser storage and can
                be cleared with the rest of the site data.
            </p>
        </EditorialPage>
    );
}
