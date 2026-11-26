import EditorialPage from "@/components/pages/EditorialPage";
import ContactForm from "@/components/contact/ContactForm";
import { siteConfig } from "@/lib/seo/site-config";

export default function ContactPage() {
    return (
        <EditorialPage
            title="Contact"
            description="Send a question, report a correction, or get in touch with the Protonixs Journal team."
            path="/contact"
        >
            <section className="contact-card">
                <h2>Write to us</h2>
                <p>
                    Email{" "}
                    <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                    {" "}or use the form below. Please do not include passwords, API keys, or other sensitive information.
                </p>
                <ContactForm />
            </section>
            <section>
                <h2>Publisher</h2>
                <p>{siteConfig.legalName}</p>
                <p>
                    {siteConfig.address.streetAddress}, {siteConfig.address.addressLocality},{" "}
                    {siteConfig.address.addressRegion} {siteConfig.address.postalCode},{" "}
                    {siteConfig.address.addressCountry}
                </p>
                <p><a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a></p>
            </section>
        </EditorialPage>
    );
}
