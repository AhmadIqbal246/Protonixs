import EditorialPage from "@/components/pages/EditorialPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";

export const metadata = buildMetadata({
    title: "Privacy Policy | Protonixs Journal",
    description: "How Protonixs Journal handles contact details, analytics, cookies, and advertising data.",
    path: "/privacy",
});

export default function PrivacyPage() {
    return (
        <EditorialPage
            title="Privacy Policy"
            description="This policy explains what information may be collected when you use Protonixs Journal."
            path="/privacy"
        >
            <h2>Who operates this site</h2>
            <p>
                Protonixs operates this website. You can contact us at{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            </p>
            <h2>Information you provide</h2>
            <p>
                If you use the contact form, we receive the name, email address, subject, and
                message you submit. We use that information to respond to your request and
                maintain the correspondence. Do not send passwords, payment details, or
                confidential project information through the form.
            </p>
            <h2>Analytics and technical information</h2>
            <p>
                The site may use Google Tag Manager and analytics tags to understand visits
                and improve the site. Those services can process technical information such
                as browser, device, and page-visit data. Their collection depends on the tags
                configured for this website and your browser settings.
            </p>
            <h2>Cookies and advertising</h2>
            <p>
                We use browser storage to remember your light or dark theme preference.
                Analytics tags may also use cookies or similar technologies. Advertising is
                not displayed by default. If Google AdSense is enabled, Google and other
                third-party vendors may use cookies or device identifiers to serve and measure
                ads. Depending on your location and consent choices, ads may be personalized
                or non-personalized. Read the{" "}
                <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer" target="_blank">
                    Google advertising and cookie information
                </a>.
            </p>
            <p>
                Before enabling personalized advertising for visitors in the EEA, UK, or
                Switzerland, the publisher must configure an appropriate Google-certified
                consent management platform. This site does not currently provide that
                consent platform. You can control cookies through your browser, although
                blocking them may affect site preferences and third-party features.
            </p>
            <h2>Sharing and retention</h2>
            <p>
                We do not sell contact-form submissions. Information may be processed by
                service providers needed to operate the site, such as email, hosting,
                analytics, or advertising providers when enabled. We keep correspondence
                only as long as reasonably needed to respond, maintain business records, or
                meet legal obligations.
            </p>
            <h2>Your choices and questions</h2>
            <p>
                You may ask us about or request access to information you submitted by
                contacting {siteConfig.email}. Some technical data is handled directly by
                third-party providers and may be subject to their own privacy policies.
            </p>
        </EditorialPage>
    );
}
