import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schemas";

export default function Breadcrumbs({ items }) {
    return (
        <>
            <JsonLd data={breadcrumbSchema(items)} />
            <nav aria-label="Breadcrumbs" className="breadcrumbs">
                <ol>
                    {items.map((item, index) => (
                        <li key={`${item.path}-${item.name}`}>
                            {index === items.length - 1
                                ? item.name
                                : <Link href={item.path}>{item.name}</Link>}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
