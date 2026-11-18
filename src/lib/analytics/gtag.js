export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-W4VJHMJ9";

export function pageview(url) {
    if (!GTM_ID || typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: "page_view",
        page_path: url,
    });
}

export function event({ action, category, label, value }) {
    if (!GTM_ID || typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === "function") {
        window.gtag("event", action, {
            event_category: category,
            event_label: label,
            value,
        });
        return;
    }
    window.dataLayer.push({
        event: action,
        event_category: category,
        event_label: label,
        value,
    });
}

export function trackContactFormSubmit(formName = "contact") {
    event({ action: "form_submit", category: "engagement", label: formName });
}
