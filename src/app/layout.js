import { inter } from '@/lib/fonts';
import './globals.css';
import Script from 'next/script';
import GoogleAnalytics, { GoogleTagManagerNoscript } from '@/components/analytics/GoogleAnalytics';
import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { globalSchemas } from '@/lib/seo/schemas';
import { siteConfig } from '@/lib/seo/site-config';

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const consentPlatformConfigured = process.env.NEXT_PUBLIC_CONSENT_PLATFORM_CONFIGURED === "true";
if (adsenseClientId && !/^ca-pub-\d+$/.test(adsenseClientId)) {
    throw new Error('NEXT_PUBLIC_ADSENSE_CLIENT_ID must be a valid ca-pub- publisher ID.');
}

const verification = {};
if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) {
    verification.other = { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION };
}

export const metadata = {
    metadataBase: new URL(siteConfig.url),
    ...pageMetadata.home,
    ...(Object.keys(verification).length ? { verification } : {}),
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.variable} data-theme="light">
            <body>
                {consentPlatformConfigured ? <GoogleTagManagerNoscript /> : null}
                <JsonLd data={globalSchemas()} />
                {consentPlatformConfigured ? <GoogleAnalytics /> : null}
                {consentPlatformConfigured && adsenseClientId ? (
                    <Script
                        async
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
                    />
                ) : null}
                {children}
            </body>
        </html>
    );
}
