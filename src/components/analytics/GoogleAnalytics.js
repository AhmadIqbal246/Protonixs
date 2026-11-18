"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { GTM_ID, pageview } from "@/lib/analytics/gtag";

function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(() => {
        if (!GTM_ID) return;
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        pageview(url);
    }, [pathname, searchParams]);
    return null;
}

export default function GoogleAnalytics() {
    if (!GTM_ID) return null;
    return (
        <>
            <Script id="gtm-init" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());`}
            </Script>
            <Script
                src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
                strategy="afterInteractive"
            />
            <Suspense fallback={null}>
                <AnalyticsTracker />
            </Suspense>
        </>
    );
}

export function GoogleTagManagerNoscript() {
    if (!GTM_ID) return null;
    return (
        <noscript>
            <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
            />
        </noscript>
    );
}
